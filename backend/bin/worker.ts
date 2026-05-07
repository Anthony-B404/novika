/*
|--------------------------------------------------------------------------
| Worker entrypoint
|--------------------------------------------------------------------------
|
| The "worker.ts" file is the entrypoint for starting the BullMQ workers.
| This file boots the AdonisJS application and starts the queue workers.
|
*/

import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

async function startWorker() {
  const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER }).tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })

  // Create and boot the application without starting HTTP server
  const app = await ignitor.createApp('console')
  await app.boot()

  // Sanity check: Lucid's database_provider.boot() must have set BaseModel.$adapter.
  // Without it, every Audio.find/query call throws
  // "Cannot read properties of undefined (reading 'query')".
  const { BaseModel } = await import('@adonisjs/lucid/orm')
  if (!BaseModel.$adapter) {
    console.error('[Worker] FATAL: BaseModel.$adapter not set after app.boot()')
    process.exitCode = 1
    return
  }
  console.log('[Worker] BaseModel.$adapter ready')

  // Eager-load all models BEFORE workers start. Models loaded later via dynamic
  // imports may, in some prod ESM resolution edge cases, end up extending a
  // different BaseModel instance than the one the adapter was attached to.
  await Promise.all([
    import('#models/user'),
    import('#models/organization'),
    import('#models/audio'),
    import('#models/transcription'),
    import('#models/credit_transaction'),
    import('#models/user_credit_transaction'),
  ])
  console.log('[Worker] Models eagerly loaded')

  // Import and start workers after app is booted
  await import('#start/worker')
  console.log('[Worker] All workers started successfully')

  // Keep the process running
  await new Promise(() => {})
}

startWorker().catch((error: Error) => {
  process.exitCode = 1
  prettyPrintError(error)
})
