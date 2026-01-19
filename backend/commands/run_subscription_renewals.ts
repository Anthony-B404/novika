import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class RunSubscriptionRenewals extends BaseCommand {
  static commandName = 'subscription:renew'
  static description = 'Run subscription renewals manually (for testing)'

  static options: CommandOptions = {
    startApp: true, // Required to access models and database
  }

  async run() {
    const { processSubscriptionRenewals } = await import('#jobs/subscription_renewal_job')

    this.logger.info('Starting subscription renewal process...')

    const result = await processSubscriptionRenewals()

    this.logger.info(`Processed: ${result.processed}`)
    this.logger.success(`Successful: ${result.successful}`)
    this.logger.warning(`Skipped: ${result.skipped}`)
    if (result.failed > 0) {
      this.logger.error(`Failed: ${result.failed}`)
    }

    // Show details
    if (result.details.length > 0) {
      this.logger.info('\nDetails:')
      for (const detail of result.details) {
        const status =
          detail.status === 'success'
            ? this.colors.green(detail.status)
            : detail.status === 'skipped'
              ? this.colors.yellow(detail.status)
              : this.colors.red(detail.status)

        this.logger.info(
          `  - ${detail.organizationName}: ${status}` +
            (detail.creditsTransferred ? ` (${detail.creditsTransferred} credits)` : '') +
            (detail.reason ? ` - ${detail.reason}` : '')
        )
      }
    } else {
      this.logger.info('No subscriptions due for renewal.')
    }
  }
}
