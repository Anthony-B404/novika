import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audios'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Organization scope (multi-tenant)
      table
        .integer('organization_id')
        .unsigned()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
        .notNullable()

      // Owner of the audio
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()

      // Audio metadata
      table.string('title', 255).nullable()
      table.string('file_name', 255).notNullable()
      table.string('file_path', 500).notNullable()
      table.integer('file_size').unsigned().notNullable() // bytes
      table.string('mime_type', 100).nullable()
      table.integer('duration').unsigned().nullable() // seconds

      // Processing status
      table
        .enum('status', ['pending', 'processing', 'completed', 'failed'])
        .defaultTo('pending')
        .notNullable()
      table.text('error_message').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes for common queries
      table.index(['organization_id', 'status'])
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
