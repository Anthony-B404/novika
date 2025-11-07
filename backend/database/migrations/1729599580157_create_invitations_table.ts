import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invitations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('identifier').notNullable()
      table.string('email').notNullable()
      table.integer('organization_id').references('id').inTable('organizations')
      table.timestamp('expires_at').notNullable()
      table.boolean('accepted').notNullable().defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
