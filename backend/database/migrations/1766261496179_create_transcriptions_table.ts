import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transcriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // One-to-one relationship with audio
      table
        .integer('audio_id')
        .unsigned()
        .references('id')
        .inTable('audios')
        .onDelete('CASCADE')
        .notNullable()
        .unique() // One transcription per audio

      // Transcription content
      table.text('raw_text').notNullable()
      table.string('language', 10).defaultTo('fr').notNullable()

      // Optional metadata
      table.jsonb('timestamps').nullable() // Segments with timing info
      table.decimal('confidence', 5, 4).nullable() // Score 0.0000-1.0000

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
