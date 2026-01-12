import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Step 1: Migrate credits from users to their current organization
    // Only for users with credits > 0 AND a current_organization_id set
    await this.db.rawQuery(`
      UPDATE organizations o
      SET credits = o.credits + COALESCE(
        (SELECT SUM(u.credits)
         FROM users u
         WHERE u.current_organization_id = o.id
         AND u.credits > 0),
        0
      )
      WHERE EXISTS (
        SELECT 1 FROM users u
        WHERE u.current_organization_id = o.id
        AND u.credits > 0
      )
    `)

    // Step 2: Backfill organization_id in credit_transactions based on user's current_organization_id
    await this.db.rawQuery(`
      UPDATE credit_transactions ct
      SET organization_id = (
        SELECT u.current_organization_id
        FROM users u
        WHERE u.id = ct.user_id
      )
      WHERE ct.organization_id IS NULL
    `)

    // Step 3: Drop the credits column from users table
    this.schema.alterTable('users', (table) => {
      table.dropColumn('credits')
    })
  }

  async down() {
    // Re-add credits column to users
    this.schema.alterTable('users', (table) => {
      table.integer('credits').unsigned().defaultTo(0).notNullable()
    })

    // Note: We cannot fully reverse the credit migration as credits were aggregated
    // The organization credits would need to be manually redistributed if needed
  }
}
