import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class WorkerStart extends BaseCommand {
  static commandName = 'worker:start'
  static description = 'Start BullMQ workers for background jobs (transcription, GDPR, etc.)'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  async run() {
    await import('#start/worker')
    this.logger.info('All workers started successfully')
  }
}
