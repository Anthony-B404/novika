import { Worker, Job } from 'bullmq'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'
import queueConfig from '#config/queue'
import Organization from '#models/organization'
import Reseller from '#models/reseller'
import ResellerTransaction, { ResellerTransactionType } from '#models/reseller_transaction'
import CreditTransaction, { CreditTransactionType } from '#models/credit_transaction'
import UserCredit from '#models/user_credit'
import creditService, { type AutoRefillResult } from '#services/credit_service'

// NOTE: Global auto-refill has been simplified.
// When global auto-refill is enabled, it now directly creates/updates user_credit records
// with autoRefillEnabled=true, so all users are processed in the individual phase only.

export interface SubscriptionRenewalJobData {
  organizationId: number
}

export interface SubscriptionRenewalJobResult {
  success: boolean
  creditsTransferred?: number
  skipped?: boolean
  skipReason?: string
  error?: string
}

export interface SubscriptionRenewalBatchResult {
  processed: number
  successful: number
  skipped: number
  failed: number
  details: {
    organizationId: number
    organizationName: string
    status: 'success' | 'skipped' | 'failed'
    creditsTransferred?: number
    reason?: string
  }[]
}

export interface UserAutoRefillBatchResult {
  processed: number
  successful: number
  skipped: number
  failed: number
  details: AutoRefillResult[]
}

export interface CombinedRenewalResult {
  organizationRenewals: SubscriptionRenewalBatchResult
  userAutoRefills: UserAutoRefillBatchResult
}

/**
 * Process a single subscription renewal.
 */
async function processSubscriptionRenewal(
  job: Job<SubscriptionRenewalJobData, SubscriptionRenewalJobResult>
): Promise<SubscriptionRenewalJobResult> {
  const { organizationId } = job.data

  logger.info(`[SubscriptionRenewalJob ${job.id}] Processing organization: ${organizationId}`)

  try {
    const organization = await Organization.query()
      .where('id', organizationId)
      .preload('reseller')
      .first()

    if (!organization) {
      logger.info(`[SubscriptionRenewalJob ${job.id}] Organization not found: ${organizationId}`)
      return { success: false, error: 'Organization not found' }
    }

    // Verify subscription is still active
    if (!organization.isSubscriptionActive) {
      logger.info(`[SubscriptionRenewalJob ${job.id}] Subscription not active, skipping`)
      return { success: true, skipped: true, skipReason: 'Subscription not active' }
    }

    // Calculate credits needed
    const creditsNeeded = organization.getCreditsNeededForRenewal()

    // If no credits needed (already at or above target), just update next renewal date
    if (creditsNeeded === 0) {
      logger.info(
        `[SubscriptionRenewalJob ${job.id}] No credits needed, updating next renewal date`
      )
      organization.lastRenewalAt = DateTime.now()
      organization.nextRenewalAt = organization.calculateNextRenewalDate()
      await organization.save()
      return {
        success: true,
        skipped: true,
        skipReason: 'Credits already at target',
        creditsTransferred: 0,
      }
    }

    // Get reseller
    const reseller = organization.reseller || (await Reseller.find(organization.resellerId))

    if (!reseller) {
      logger.info(`[SubscriptionRenewalJob ${job.id}] Reseller not found`)
      return { success: false, error: 'Reseller not found' }
    }

    // Check if reseller has enough credits
    if (!reseller.hasEnoughCredits(creditsNeeded)) {
      logger.info(
        `[SubscriptionRenewalJob ${job.id}] Insufficient reseller credits. ` +
          `Need: ${creditsNeeded}, Available: ${reseller.creditBalance}`
      )
      // Don't update nextRenewalAt so it will retry tomorrow
      return {
        success: false,
        error: `Insufficient reseller credits. Need: ${creditsNeeded}, Available: ${reseller.creditBalance}`,
      }
    }

    // Perform atomic credit transfer
    await db.transaction(async (trx) => {
      // 1. Deduct from reseller pool
      reseller.creditBalance -= creditsNeeded
      await reseller.useTransaction(trx).save()

      // 2. Create reseller transaction
      await ResellerTransaction.create(
        {
          resellerId: reseller.id,
          amount: -creditsNeeded,
          type: ResellerTransactionType.SubscriptionRenewal,
          targetOrganizationId: organization.id,
          description: `Subscription renewal for ${organization.name}`,
          performedByUserId: null, // System action
        },
        { client: trx }
      )

      // 3. Add credits to organization
      organization.credits += creditsNeeded
      organization.lastRenewalAt = DateTime.now()
      organization.nextRenewalAt = organization.calculateNextRenewalDate()
      await organization.useTransaction(trx).save()

      // 4. Create organization credit transaction
      await CreditTransaction.create(
        {
          userId: null, // System action
          organizationId: organization.id,
          amount: creditsNeeded,
          balanceAfter: organization.credits,
          type: CreditTransactionType.Subscription,
          description: `Monthly subscription renewal`,
        },
        { client: trx }
      )
    })

    logger.info(
      `[SubscriptionRenewalJob ${job.id}] Successfully transferred ${creditsNeeded} credits to ${organization.name}`
    )

    return {
      success: true,
      creditsTransferred: creditsNeeded,
    }
  } catch (error) {
    logger.error(`[SubscriptionRenewalJob ${job.id}] Error:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create and start the subscription renewal worker.
 */
export function createSubscriptionRenewalWorker(): Worker<
  SubscriptionRenewalJobData,
  SubscriptionRenewalJobResult
> {
  const worker = new Worker<SubscriptionRenewalJobData, SubscriptionRenewalJobResult>(
    queueConfig.queues.subscriptionRenewal.name,
    processSubscriptionRenewal,
    {
      connection: queueConfig.connection,
      concurrency: queueConfig.queues.subscriptionRenewal.concurrency,
    }
  )

  worker.on('completed', (job) => {
    logger.info(`[SubscriptionRenewalWorker] Job ${job.id} completed`)
  })

  worker.on('failed', (job, error) => {
    logger.error(`[SubscriptionRenewalWorker] Job ${job?.id} failed:`, error.message)
  })

  worker.on('error', (error) => {
    logger.error('[SubscriptionRenewalWorker] Error:', error)
  })

  return worker
}

/**
 * Find and process all pending subscription renewals.
 * This should be called by a scheduler (e.g., daily cron job at 00:05 UTC).
 */
export async function processSubscriptionRenewals(): Promise<SubscriptionRenewalBatchResult> {
  const now = DateTime.now()

  logger.info(
    `[SubscriptionRenewalScheduler] Starting subscription renewal process at ${now.toISO()}`
  )

  // Find all active subscriptions that are due for renewal
  const organizations = await Organization.query()
    .where('subscription_enabled', true)
    .whereNull('subscription_paused_at')
    .where('next_renewal_at', '<=', now.toSQL())
    .preload('reseller')

  logger.info(
    `[SubscriptionRenewalScheduler] Found ${organizations.length} subscription(s) due for renewal`
  )

  const result: SubscriptionRenewalBatchResult = {
    processed: organizations.length,
    successful: 0,
    skipped: 0,
    failed: 0,
    details: [],
  }

  // Process each organization
  for (const organization of organizations) {
    try {
      const creditsNeeded = organization.getCreditsNeededForRenewal()

      // If no credits needed, just update dates
      if (creditsNeeded === 0) {
        organization.lastRenewalAt = DateTime.now()
        organization.nextRenewalAt = organization.calculateNextRenewalDate()
        await organization.save()

        result.skipped++
        result.details.push({
          organizationId: organization.id,
          organizationName: organization.name,
          status: 'skipped',
          reason: 'Credits already at target',
          creditsTransferred: 0,
        })
        continue
      }

      const reseller = organization.reseller

      if (!reseller) {
        result.failed++
        result.details.push({
          organizationId: organization.id,
          organizationName: organization.name,
          status: 'failed',
          reason: 'Reseller not found',
        })
        continue
      }

      // Check reseller credits
      if (!reseller.hasEnoughCredits(creditsNeeded)) {
        result.failed++
        result.details.push({
          organizationId: organization.id,
          organizationName: organization.name,
          status: 'failed',
          reason: `Insufficient reseller credits. Need: ${creditsNeeded}, Available: ${reseller.creditBalance}`,
        })
        // Don't update nextRenewalAt - will retry tomorrow
        continue
      }

      // Perform credit transfer
      await db.transaction(async (trx) => {
        // Deduct from reseller
        reseller.creditBalance -= creditsNeeded
        await reseller.useTransaction(trx).save()

        // Create reseller transaction
        await ResellerTransaction.create(
          {
            resellerId: reseller.id,
            amount: -creditsNeeded,
            type: ResellerTransactionType.SubscriptionRenewal,
            targetOrganizationId: organization.id,
            description: `Subscription renewal for ${organization.name}`,
            performedByUserId: null,
          },
          { client: trx }
        )

        // Add to organization
        organization.credits += creditsNeeded
        organization.lastRenewalAt = DateTime.now()
        organization.nextRenewalAt = organization.calculateNextRenewalDate()
        await organization.useTransaction(trx).save()

        // Create organization transaction
        await CreditTransaction.create(
          {
            userId: null,
            organizationId: organization.id,
            amount: creditsNeeded,
            balanceAfter: organization.credits,
            type: CreditTransactionType.Subscription,
            description: `Monthly subscription renewal`,
          },
          { client: trx }
        )
      })

      result.successful++
      result.details.push({
        organizationId: organization.id,
        organizationName: organization.name,
        status: 'success',
        creditsTransferred: creditsNeeded,
      })

      logger.info(
        `[SubscriptionRenewalScheduler] Renewed ${organization.name}: ${creditsNeeded} credits`
      )
    } catch (error) {
      result.failed++
      result.details.push({
        organizationId: organization.id,
        organizationName: organization.name,
        status: 'failed',
        reason: error instanceof Error ? error.message : 'Unknown error',
      })
      logger.error(`[SubscriptionRenewalScheduler] Error processing ${organization.name}:`, error)
    }
  }

  logger.info(
    `[SubscriptionRenewalScheduler] Completed. ` +
      `Successful: ${result.successful}, Skipped: ${result.skipped}, Failed: ${result.failed}`
  )

  return result
}

/**
 * Process all user auto-refills that are due today.
 * Processes all user_credit records with autoRefillEnabled=true and autoRefillDay=today.
 *
 * NOTE: Global auto-refill now directly sets autoRefillEnabled on user_credit records,
 * so all users (both individual and global) are processed uniformly here.
 *
 * Should be called AFTER organization subscription renewals.
 */
export async function processUserAutoRefills(): Promise<UserAutoRefillBatchResult> {
  const today = DateTime.now().day

  logger.info(`[UserAutoRefillScheduler] Starting user auto-refill process for day ${today}`)

  const result: UserAutoRefillBatchResult = {
    processed: 0,
    successful: 0,
    skipped: 0,
    failed: 0,
    details: [],
  }

  // Find all user credits with auto-refill enabled for today
  // This includes both individual settings and those set via global auto-refill
  const userCredits = await UserCredit.query()
    .where('autoRefillEnabled', true)
    .where('autoRefillDay', today)
    .preload('user')
    .preload('organization')

  logger.info(
    `[UserAutoRefillScheduler] Found ${userCredits.length} user(s) with auto-refill for today`
  )

  for (const userCredit of userCredits) {
    const refillResult = await creditService.processAutoRefill(userCredit)

    result.processed++
    if (refillResult.status === 'success') {
      result.successful++
    } else if (refillResult.status === 'skipped') {
      result.skipped++
    } else {
      result.failed++
    }

    result.details.push(refillResult)

    if (refillResult.status === 'success') {
      logger.info(
        `[UserAutoRefillScheduler] Refill ${refillResult.userName}: ${refillResult.creditsTransferred} credits`
      )
    }
  }

  logger.info(
    `[UserAutoRefillScheduler] Completed. ` +
      `Processed: ${result.processed}, Successful: ${result.successful}, Skipped: ${result.skipped}, Failed: ${result.failed}`
  )

  return result
}

/**
 * Process all pending renewals: organizations first, then users.
 */
export async function processAllRenewals(): Promise<CombinedRenewalResult> {
  // Phase 1: Organization subscription renewals
  const organizationRenewals = await processSubscriptionRenewals()

  // Phase 2: User auto-refills
  const userAutoRefills = await processUserAutoRefills()

  return {
    organizationRenewals,
    userAutoRefills,
  }
}

/**
 * Queue all pending subscription renewals for async processing.
 * Alternative to processSubscriptionRenewals for distributed processing.
 */
export async function queuePendingSubscriptionRenewals(): Promise<number> {
  const now = DateTime.now()

  // Find all active subscriptions that are due
  const organizations = await Organization.query()
    .where('subscription_enabled', true)
    .whereNull('subscription_paused_at')
    .where('next_renewal_at', '<=', now.toSQL())

  logger.info(
    `[SubscriptionRenewalScheduler] Found ${organizations.length} subscription(s) due for renewal`
  )

  // Import queue dynamically
  const { Queue } = await import('bullmq')
  const renewalQueue = new Queue(queueConfig.queues.subscriptionRenewal.name, {
    connection: queueConfig.connection,
  })

  for (const organization of organizations) {
    await renewalQueue.add(
      `renewal-${organization.id}`,
      { organizationId: organization.id },
      {
        ...queueConfig.defaultJobOptions,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000,
        },
      }
    )
    logger.info(`[SubscriptionRenewalScheduler] Queued renewal for organization ${organization.id}`)
  }

  await renewalQueue.close()
  return organizations.length
}

export default {
  createSubscriptionRenewalWorker,
  processSubscriptionRenewals,
  processUserAutoRefills,
  processAllRenewals,
  queuePendingSubscriptionRenewals,
}
