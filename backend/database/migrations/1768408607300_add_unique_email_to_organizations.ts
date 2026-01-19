import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organizations'

  async up() {
    // Use raw SQL for partial unique index on non-null emails
    // This prevents multiple organizations from having the same email
    // while allowing multiple NULL emails (PostgreSQL default behavior)
    this.schema.raw(`
      CREATE UNIQUE INDEX organizations_email_unique
      ON ${this.tableName} (email)
      WHERE email IS NOT NULL
    `)
  }

  async down() {
    this.schema.raw(`
      DROP INDEX IF EXISTS organizations_email_unique
    `)
  }
}
