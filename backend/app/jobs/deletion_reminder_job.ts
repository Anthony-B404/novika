import { Worker, Job } from 'bullmq'
import { DateTime } from 'luxon'
import queueConfig from '#config/queue'
import gdprService from '#services/gdpr_service'
import DeletionRequest, { DeletionRequestStatus } from '#models/deletion_request'
import User from '#models/user'
import env from '#start/env'
import i18nManager from '@adonisjs/i18n/services/main'

export interface ReminderJobData {
  deletionRequestId: number
  daysRemaining: number
}

export interface ReminderJobResult {
  success: boolean
  emailSent: boolean
  error?: string
}

/**
 * Process a single reminder notification.
 */
async function processReminderJob(
  job: Job<ReminderJobData, ReminderJobResult>
): Promise<ReminderJobResult> {
  const { deletionRequestId, daysRemaining } = job.data

  console.log(
    `[ReminderJob ${job.id}] Processing reminder for request ${deletionRequestId} (${daysRemaining} days remaining)`
  )

  try {
    const deletionRequest = await DeletionRequest.find(deletionRequestId)

    if (!deletionRequest) {
      console.log(`[ReminderJob ${job.id}] Deletion request not found: ${deletionRequestId}`)
      return { success: false, emailSent: false, error: 'Deletion request not found' }
    }

    // Check if request is still pending
    if (deletionRequest.status !== DeletionRequestStatus.Pending) {
      console.log(
        `[ReminderJob ${job.id}] Deletion request status is ${deletionRequest.status}, skipping`
      )
      return {
        success: true,
        emailSent: false,
        error: `Request status is ${deletionRequest.status}`,
      }
    }

    // Load the user
    const user = await User.find(deletionRequest.userId)
    if (!user) {
      console.log(`[ReminderJob ${job.id}] User not found: ${deletionRequest.userId}`)
      return { success: false, emailSent: false, error: 'User not found' }
    }

    // Get i18n instance for user's locale (default to French)
    const i18n = i18nManager.locale('fr')
    const frontendUrl = env.get('FRONTEND_URL', 'http://localhost:3000')

    // Send reminder email
    await gdprService.sendDeletionReminderEmail(
      user,
      deletionRequest,
      daysRemaining,
      i18n,
      frontendUrl
    )

    console.log(`[ReminderJob ${job.id}] Reminder email sent to ${user.email}`)

    return {
      success: true,
      emailSent: true,
    }
  } catch (error) {
    console.error(`[ReminderJob ${job.id}] Error processing reminder:`, error)
    return {
      success: false,
      emailSent: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create and start the GDPR reminder worker.
 */
export function createReminderWorker(): Worker<ReminderJobData, ReminderJobResult> {
  const worker = new Worker<ReminderJobData, ReminderJobResult>(
    queueConfig.queues.gdprReminder.name,
    processReminderJob,
    {
      connection: queueConfig.connection,
      concurrency: queueConfig.queues.gdprReminder.concurrency,
    }
  )

  worker.on('completed', (job) => {
    console.log(`[ReminderWorker] Job ${job.id} completed successfully`)
  })

  worker.on('failed', (job, error) => {
    console.error(`[ReminderWorker] Job ${job?.id} failed:`, error.message)
  })

  worker.on('error', (error) => {
    console.error('[ReminderWorker] Error:', error)
  })

  return worker
}

/**
 * Find and queue reminders for deletion requests.
 * Sends reminders at J-7 and J-1 before scheduled deletion.
 * This should be called by a scheduler (e.g., daily cron job).
 */
export async function queuePendingReminders(): Promise<number> {
  const now = DateTime.now()
  const reminderDays = [7, 1] // Days before deletion to send reminders
  let totalQueued = 0

  // Import queue service dynamically to avoid circular dependencies
  const { Queue } = await import('bullmq')
  const reminderQueue = new Queue(queueConfig.queues.gdprReminder.name, {
    connection: queueConfig.connection,
  })

  for (const daysRemaining of reminderDays) {
    // Find requests scheduled for exactly N days from now
    const targetDate = now.plus({ days: daysRemaining })
    const startOfDay = targetDate.startOf('day')
    const endOfDay = targetDate.endOf('day')

    const pendingRequests = await DeletionRequest.query()
      .where('status', DeletionRequestStatus.Pending)
      .where('scheduledFor', '>=', startOfDay.toSQL())
      .where('scheduledFor', '<=', endOfDay.toSQL())

    console.log(
      `[ReminderScheduler] Found ${pendingRequests.length} request(s) due in ${daysRemaining} day(s)`
    )

    for (const request of pendingRequests) {
      // Use a unique job ID to prevent duplicate reminders
      const jobId = `reminder-${request.id}-d${daysRemaining}`

      await reminderQueue.add(
        jobId,
        {
          deletionRequestId: request.id,
          daysRemaining,
        },
        {
          ...queueConfig.defaultJobOptions,
          jobId, // Prevent duplicate jobs with same ID
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 30000, // 30 seconds initial delay for retries
          },
        }
      )
      console.log(
        `[ReminderScheduler] Queued reminder for request ${request.id} (J-${daysRemaining})`
      )
      totalQueued++
    }
  }

  await reminderQueue.close()
  return totalQueued
}

export default { createReminderWorker, queuePendingReminders }
