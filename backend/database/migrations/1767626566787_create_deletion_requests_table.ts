import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'deletion_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // User reference
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()

      // Unique token for cancellation link
      table.string('token', 64).unique().notNullable()

      // Status tracking
      table
        .enum('status', ['pending', 'processing', 'completed', 'cancelled'])
        .defaultTo('pending')
        .notNullable()

      // Timestamps for tracking
      table.timestamp('requested_at').notNullable()
      table.timestamp('scheduled_for').notNullable() // requested_at + 30 days
      table.timestamp('processed_at').nullable()
      table.timestamp('cancelled_at').nullable()

      // Decision for orphan organizations: { orgId: { action: 'transfer'|'delete', newOwnerId?: number } }
      table.json('orphan_orgs_decision').nullable()

      // Summary of deleted data after processing
      table.text('deletion_summary').nullable()

      table.timestamps(true, true)

      // Indexes
      table.index(['user_id'])
      table.index(['status', 'scheduled_for'])
      table.index(['token'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
