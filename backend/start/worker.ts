/*
|--------------------------------------------------------------------------
| Worker preload file
|--------------------------------------------------------------------------
|
| This file is loaded when the application starts.
| It initializes the BullMQ workers for background job processing.
|
*/

import { createTranscriptionWorker } from '#jobs/transcription_job'
import { createDeletionWorker } from '#jobs/deletion_job'
import { createReminderWorker } from '#jobs/deletion_reminder_job'

let transcriptionWorker: ReturnType<typeof createTranscriptionWorker> | null = null
let deletionWorker: ReturnType<typeof createDeletionWorker> | null = null
let reminderWorker: ReturnType<typeof createReminderWorker> | null = null

/**
 * Start all workers.
 */
function startWorkers() {
  // Transcription worker
  if (!transcriptionWorker) {
    try {
      transcriptionWorker = createTranscriptionWorker()
      console.log('[Worker] Transcription worker started successfully')
    } catch (error) {
      console.error('[Worker] Failed to start transcription worker:', error)
    }
  }

  // GDPR Deletion worker
  if (!deletionWorker) {
    try {
      deletionWorker = createDeletionWorker()
      console.log('[Worker] GDPR deletion worker started successfully')
    } catch (error) {
      console.error('[Worker] Failed to start deletion worker:', error)
    }
  }

  // GDPR Reminder worker
  if (!reminderWorker) {
    try {
      reminderWorker = createReminderWorker()
      console.log('[Worker] GDPR reminder worker started successfully')
    } catch (error) {
      console.error('[Worker] Failed to start reminder worker:', error)
    }
  }
}

/**
 * Handle graceful shutdown.
 */
async function shutdown() {
  console.log('[Worker] Shutting down all workers...')

  const shutdownPromises = []

  if (transcriptionWorker) {
    shutdownPromises.push(transcriptionWorker.close())
    transcriptionWorker = null
  }

  if (deletionWorker) {
    shutdownPromises.push(deletionWorker.close())
    deletionWorker = null
  }

  if (reminderWorker) {
    shutdownPromises.push(reminderWorker.close())
    reminderWorker = null
  }

  await Promise.all(shutdownPromises)
  console.log('[Worker] All workers shutdown complete')
}

// Register shutdown handlers
process.on('SIGTERM', async () => {
  await shutdown()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await shutdown()
  process.exit(0)
})

// Start all workers
startWorkers()
