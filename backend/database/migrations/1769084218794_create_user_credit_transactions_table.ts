import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_credit_transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('organization_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
      table
        .integer('performed_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.integer('amount').notNullable()
      table.integer('balance_after').notNullable()
      table.string('type', 50).notNullable()
      table.string('description', 255).nullable()
      table
        .integer('audio_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('audios')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()

      table.index(['user_id', 'organization_id'])
      table.index(['organization_id', 'created_at'])
      table.index(['type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
