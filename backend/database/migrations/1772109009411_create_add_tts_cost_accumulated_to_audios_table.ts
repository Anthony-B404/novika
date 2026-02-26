import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audios'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('tts_cost_accumulated', 10, 6).notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tts_cost_accumulated')
    })
  }
}
