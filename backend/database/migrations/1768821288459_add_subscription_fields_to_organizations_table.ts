import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // 1. Add subscription fields to organizations
    this.schema.alterTable('organizations', (table) => {
      // Subscription configuration
      table.boolean('subscription_enabled').notNullable().defaultTo(false)
      table.integer('monthly_credits_target').unsigned().nullable()
      table
        .enum('renewal_type', ['first_of_month', 'anniversary'], {
          useNative: true,
          enumName: 'renewal_type_enum',
        })
        .nullable()
      table.integer('renewal_day').unsigned().nullable() // 1-28 for anniversary type

      // Subscription lifecycle dates
      table.timestamp('subscription_created_at').nullable()
      table.timestamp('subscription_paused_at').nullable()
      table.timestamp('last_renewal_at').nullable()
      table.timestamp('next_renewal_at').nullable()

      // Index for efficient querying of active subscriptions
      table.index(
        ['subscription_enabled', 'subscription_paused_at', 'next_renewal_at'],
        'idx_active_subscriptions'
      )
    })

    // 2. Update reseller_transactions: Add subscription_renewal type
    this.schema.raw(`
      ALTER TABLE reseller_transactions
      DROP CONSTRAINT IF EXISTS reseller_transactions_type_check
    `)

    this.schema.raw(`
      ALTER TABLE reseller_transactions
      ADD CONSTRAINT reseller_transactions_type_check
      CHECK (type IN ('purchase', 'distribution', 'adjustment', 'subscription_renewal'))
    `)

    // 3. Update reseller_transactions: Make performed_by_user_id nullable for system actions
    this.schema.raw(`
      ALTER TABLE reseller_transactions
      DROP CONSTRAINT IF EXISTS reseller_transactions_performed_by_user_id_foreign
    `)

    this.schema.raw(`
      ALTER TABLE reseller_transactions
      ALTER COLUMN performed_by_user_id DROP NOT NULL
    `)

    this.schema.raw(`
      ALTER TABLE reseller_transactions
      ADD CONSTRAINT reseller_transactions_performed_by_user_id_foreign
      FOREIGN KEY (performed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    `)

    // 4. Update credit_transactions: Make user_id nullable for system actions
    this.schema.raw(`
      ALTER TABLE credit_transactions
      DROP CONSTRAINT IF EXISTS credit_transactions_user_id_foreign
    `)

    this.schema.raw(`
      ALTER TABLE credit_transactions
      ALTER COLUMN user_id DROP NOT NULL
    `)

    this.schema.raw(`
      ALTER TABLE credit_transactions
      ADD CONSTRAINT credit_transactions_user_id_foreign
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    `)
  }

  async down() {
    // Revert organizations table
    this.schema.alterTable('organizations', (table) => {
      table.dropIndex(
        ['subscription_enabled', 'subscription_paused_at', 'next_renewal_at'],
        'idx_active_subscriptions'
      )

      table.dropColumn('subscription_enabled')
      table.dropColumn('monthly_credits_target')
      table.dropColumn('renewal_type')
      table.dropColumn('renewal_day')
      table.dropColumn('subscription_created_at')
      table.dropColumn('subscription_paused_at')
      table.dropColumn('last_renewal_at')
      table.dropColumn('next_renewal_at')
    })

    // Drop the enum type
    this.schema.raw('DROP TYPE IF EXISTS renewal_type_enum')

    // Revert reseller_transactions type enum
    this.schema.raw(`
      ALTER TABLE reseller_transactions
      DROP CONSTRAINT IF EXISTS reseller_transactions_type_check
    `)

    this.schema.raw(`
      ALTER TABLE reseller_transactions
      ADD CONSTRAINT reseller_transactions_type_check
      CHECK (type IN ('purchase', 'distribution', 'adjustment'))
    `)

    // Note: We don't revert the nullable changes as it may cause data loss
  }
}
