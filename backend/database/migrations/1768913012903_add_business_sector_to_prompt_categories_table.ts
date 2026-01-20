import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'prompt_categories'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Nullable car "Général" n'a pas de secteur spécifique
      table.string('business_sector', 50).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('business_sector')
    })
  }
}
