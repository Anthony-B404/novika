import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organizations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.string('logo').nullable()
      table.string('email').notNullable().unique()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.alterTable('users', (table) => {
      table
        .integer('organization_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropForeign(['organization_id'])
      table.dropColumn('organization_id')
    })

    this.schema.dropTable(this.tableName)
  }
}
