import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'credit_transactions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add organization_id column (nullable for existing records)
      table
        .integer('organization_id')
        .unsigned()
        .references('id')
        .inTable('organizations')
        .onDelete('SET NULL')
        .nullable()

      // Add indexes for performance
      table.index(['organization_id', 'created_at'])
      table.index(['organization_id', 'type'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['organization_id', 'created_at'])
      table.dropIndex(['organization_id', 'type'])
      table.dropColumn('organization_id')
    })
  }
}
