import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Make password nullable (for backward compatibility during migration)
      table.string('password').nullable().alter()

      // Add magic link fields
      table.string('magic_link_token').nullable().unique()
      table.timestamp('magic_link_expires_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Remove magic link fields
      table.dropColumn('magic_link_token')
      table.dropColumn('magic_link_expires_at')

      // Revert password to not nullable
      table.string('password').notNullable().alter()
    })
  }
}
