/*
|--------------------------------------------------------------------------
| Worker entrypoint
|--------------------------------------------------------------------------
|
| Starts BullMQ workers via the Ace command "worker:start".
| Going through Ace ensures the AdonisJS app is fully booted (container,
| providers, services) before workers run — required for Lucid models to
| resolve their adapter.
|
*/

import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'

const APP_ROOT = new URL('../', import.meta.url)

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .ace()
  .handle(['worker:start'])
  .catch((error: Error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
