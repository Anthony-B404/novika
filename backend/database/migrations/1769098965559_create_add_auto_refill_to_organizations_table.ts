import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organizations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Global auto-refill toggle for the organization
      table.boolean('auto_refill_enabled').defaultTo(false).notNullable()
      // Default amount and day for new members when global auto-refill is active
      table.integer('auto_refill_default_amount').nullable()
      table.integer('auto_refill_default_day').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('auto_refill_enabled')
      table.dropColumn('auto_refill_default_amount')
      table.dropColumn('auto_refill_default_day')
    })
  }
}
