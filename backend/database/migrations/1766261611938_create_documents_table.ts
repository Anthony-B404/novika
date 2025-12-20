import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Required relationships
      table
        .integer('audio_id')
        .unsigned()
        .references('id')
        .inTable('audios')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('transcription_id')
        .unsigned()
        .references('id')
        .inTable('transcriptions')
        .onDelete('CASCADE')
        .notNullable()

      // Optional template (can be null for freeform)
      table
        .integer('template_id')
        .unsigned()
        .references('id')
        .inTable('templates')
        .onDelete('SET NULL')
        .nullable()

      // Document content
      table.string('title', 255).notNullable()
      table.jsonb('content').notNullable() // Structured document data

      // Document status
      table.enum('status', ['draft', 'completed', 'exported']).defaultTo('draft').notNullable()

      // Export info (when exported)
      table.string('file_path', 500).nullable() // Path to exported file
      table.enum('format', ['pdf', 'docx']).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['audio_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
