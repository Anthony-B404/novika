import { Worker, Job } from 'bullmq'
import { DateTime } from 'luxon'
import queueConfig from '#config/queue'
import gdprService from '#services/gdpr_service'
import DeletionRequest, { DeletionRequestStatus } from '#models/deletion_request'
import i18nManager from '@adonisjs/i18n/services/main'

export interface DeletionJobData {
  deletionRequestId: number
}

export interface DeletionJobResult {
  success: boolean
  deletionSummary?: object
  error?: string
}

/**
 * Process a single deletion request.
 * Called by the scheduler when a deletion request is due.
 */
async function processDeletionJob(
  job: Job<DeletionJobData, DeletionJobResult>
): Promise<DeletionJobResult> {
  const { deletionRequestId } = job.data

  console.log(`[DeletionJob ${job.id}] Processing deletion request: ${deletionRequestId}`)

  try {
    const deletionRequest = await DeletionRequest.find(deletionRequestId)

    if (!deletionRequest) {
      console.log(`[DeletionJob ${job.id}] Deletion request not found: ${deletionRequestId}`)
      return { success: false, error: 'Deletion request not found' }
    }

    // Check if request is still pending and ready to process
    if (deletionRequest.status !== DeletionRequestStatus.Pending) {
      console.log(
        `[DeletionJob ${job.id}] Deletion request status is ${deletionRequest.status}, skipping`
      )
      return { success: false, error: `Request status is ${deletionRequest.status}` }
    }

    if (!deletionRequest.isReadyToProcess()) {
      console.log(`[DeletionJob ${job.id}] Deletion request not yet due, skipping`)
      return { success: false, error: 'Request not yet due' }
    }

    // Get i18n instance for user's locale (default to French)
    const i18n = i18nManager.locale('fr')

    // Execute the deletion
    console.log(`[DeletionJob ${job.id}] Executing deletion...`)
    const summary = await gdprService.executeDeletion(deletionRequest, i18n)

    console.log(`[DeletionJob ${job.id}] Deletion completed successfully`)
    console.log(
      `[DeletionJob ${job.id}] Summary: ${summary.audioCount} audios, ${summary.transcriptionCount} transcriptions, ${summary.documentCount} documents deleted`
    )
    console.log(
      `[DeletionJob ${job.id}] Organizations: ${summary.organizationsDeleted} deleted, ${summary.organizationsTransferred} transferred`
    )

    return {
      success: true,
      deletionSummary: summary,
    }
  } catch (error) {
    console.error(`[DeletionJob ${job.id}] Error processing deletion:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create and start the GDPR deletion worker.
 */
export function createDeletionWorker(): Worker<DeletionJobData, DeletionJobResult> {
  const worker = new Worker<DeletionJobData, DeletionJobResult>(
    queueConfig.queues.gdprDeletion.name,
    processDeletionJob,
    {
      connection: queueConfig.connection,
      concurrency: queueConfig.queues.gdprDeletion.concurrency,
    }
  )

  worker.on('completed', (job) => {
    console.log(`[DeletionWorker] Job ${job.id} completed successfully`)
  })

  worker.on('failed', (job, error) => {
    console.error(`[DeletionWorker] Job ${job?.id} failed:`, error.message)
  })

  worker.on('error', (error) => {
    console.error('[DeletionWorker] Error:', error)
  })

  return worker
}

/**
 * Find and queue all pending deletion requests that are due.
 * This should be called by a scheduler (e.g., daily cron job).
 */
export async function queuePendingDeletions(): Promise<number> {
  const now = DateTime.now()

  // Find all pending requests where scheduled_for <= now
  const pendingRequests = await DeletionRequest.query()
    .where('status', DeletionRequestStatus.Pending)
    .where('scheduledFor', '<=', now.toSQL())

  console.log(`[DeletionScheduler] Found ${pendingRequests.length} pending deletion(s) due`)

  // Import queue service dynamically to avoid circular dependencies
  const { Queue } = await import('bullmq')
  const deletionQueue = new Queue(queueConfig.queues.gdprDeletion.name, {
    connection: queueConfig.connection,
  })

  for (const request of pendingRequests) {
    await deletionQueue.add(
      `deletion-${request.id}`,
      { deletionRequestId: request.id },
      {
        ...queueConfig.defaultJobOptions,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1 minute initial delay for retries
        },
      }
    )
    console.log(`[DeletionScheduler] Queued deletion request ${request.id}`)
  }

  await deletionQueue.close()
  return pendingRequests.length
}

export default { createDeletionWorker, queuePendingDeletions }
