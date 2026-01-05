import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { queuePendingDeletions } from '#jobs/deletion_job'
import { queuePendingReminders } from '#jobs/deletion_reminder_job'

/**
 * GDPR Scheduler Command
 *
 * Processes pending GDPR deletion requests and sends reminder emails.
 * Should be run daily via cron job:
 *
 * 0 2 * * * cd /path/to/backend && node ace gdpr:scheduler
 *
 * This command:
 * 1. Queues all deletion requests that are due (scheduled_for <= now)
 * 2. Sends reminder emails for requests due in 7 days and 1 day
 */
export default class GdprScheduler extends BaseCommand {
  static commandName = 'gdpr:scheduler'
  static description = 'Process pending GDPR deletions and send reminders'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting GDPR scheduler...')

    try {
      // Process pending deletions
      this.logger.info('Checking for pending deletions...')
      const deletionsQueued = await queuePendingDeletions()
      this.logger.success(`Queued ${deletionsQueued} deletion(s) for processing`)

      // Process pending reminders
      this.logger.info('Checking for pending reminders...')
      const remindersQueued = await queuePendingReminders()
      this.logger.success(`Queued ${remindersQueued} reminder(s) for sending`)

      this.logger.success('GDPR scheduler completed successfully')
    } catch (error) {
      this.logger.error('GDPR scheduler failed:', error)
      this.exitCode = 1
    }
  }
}
