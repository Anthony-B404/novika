import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'prompt_categories'

  /**
   * Mapping of default category names to their business sectors
   */
  private readonly categoryToSector = [
    { name: 'Ressources humaines', sector: 'hr' },
    { name: 'Vente et Commerce', sector: 'sales' },
    { name: 'Droit & affaires juridiques', sector: 'legal' },
    { name: 'Finance & Comptabilité', sector: 'finance' },
    { name: 'Psychologie et Thérapie', sector: 'psychology' },
    // 'Général' stays null - no update needed
  ]

  async up() {
    for (const { name, sector } of this.categoryToSector) {
      await this.db.rawQuery(
        `UPDATE ${this.tableName} SET business_sector = ? WHERE name = ? AND is_default = true`,
        [sector, name]
      )
    }
  }

  async down() {
    // Reset all business_sector values to null
    await this.db.rawQuery(`UPDATE ${this.tableName} SET business_sector = NULL`)
  }
}
