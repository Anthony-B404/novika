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

let worker: ReturnType<typeof createTranscriptionWorker> | null = null

/**
 * Start the transcription worker.
 */
function startWorker() {
  if (worker) {
    console.log('[Worker] Already running, skipping initialization')
    return
  }

  try {
    worker = createTranscriptionWorker()
    console.log('[Worker] Transcription worker started successfully')
  } catch (error) {
    console.error('[Worker] Failed to start transcription worker:', error)
  }
}

/**
 * Handle graceful shutdown.
 */
async function shutdown() {
  if (worker) {
    console.log('[Worker] Shutting down...')
    await worker.close()
    worker = null
    console.log('[Worker] Shutdown complete')
  }
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

// Start the worker
startWorker()
