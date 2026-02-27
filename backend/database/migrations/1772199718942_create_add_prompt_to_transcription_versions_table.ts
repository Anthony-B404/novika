import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transcription_versions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('prompt').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('prompt')
    })
  }
}
