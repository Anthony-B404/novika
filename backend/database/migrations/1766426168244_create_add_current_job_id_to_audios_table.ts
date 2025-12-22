import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audios'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('current_job_id', 255).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('current_job_id')
    })
  }
}
