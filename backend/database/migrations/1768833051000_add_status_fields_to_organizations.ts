import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organizations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Status field with enum-like constraint
      table
        .string('status', 20)
        .notNullable()
        .defaultTo('active')
        .comment('active, suspended, deleted')

      // Soft delete timestamp
      table.timestamp('deleted_at').nullable()

      // Suspension tracking
      table.timestamp('suspended_at').nullable()
      table.text('suspension_reason').nullable()

      // Index for efficient querying
      table.index(['status'], 'idx_organizations_status')
    })

    // Add check constraint for status values
    this.schema.raw(`
      ALTER TABLE organizations
      ADD CONSTRAINT organizations_status_check
      CHECK (status IN ('active', 'suspended', 'deleted'))
    `)
  }

  async down() {
    // Drop check constraint first
    this.schema.raw(`
      ALTER TABLE organizations
      DROP CONSTRAINT IF EXISTS organizations_status_check
    `)

    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['status'], 'idx_organizations_status')
      table.dropColumn('status')
      table.dropColumn('deleted_at')
      table.dropColumn('suspended_at')
      table.dropColumn('suspension_reason')
    })
  }
}
