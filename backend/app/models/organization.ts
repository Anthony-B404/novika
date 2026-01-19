import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import User, { UserRole } from './user.js'
import Invitation from './invitation.js'
import Reseller from './reseller.js'
import CreditTransaction, { CreditTransactionType } from './credit_transaction.js'
import type { ManyToMany, HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'

export type RenewalType = 'first_of_month' | 'anniversary'

export default class Organization extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare logo: string | null

  @column()
  declare email: string

  @column()
  declare resellerId: number | null

  @column()
  declare credits: number

  // Subscription fields
  @column()
  declare subscriptionEnabled: boolean

  @column()
  declare monthlyCreditsTarget: number | null

  @column()
  declare renewalType: RenewalType | null

  @column()
  declare renewalDay: number | null

  @column.dateTime()
  declare subscriptionCreatedAt: DateTime | null

  @column.dateTime()
  declare subscriptionPausedAt: DateTime | null

  @column.dateTime()
  declare lastRenewalAt: DateTime | null

  @column.dateTime()
  declare nextRenewalAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships

  @manyToMany(() => User, {
    pivotTable: 'organization_user',
    pivotColumns: ['role'],
  })
  declare users: ManyToMany<typeof User>

  @hasMany(() => Invitation)
  declare invitations: HasMany<typeof Invitation>

  @belongsTo(() => Reseller)
  declare reseller: BelongsTo<typeof Reseller>

  // Methods

  /**
   * Get the owner of this organization
   */
  async getOwner(): Promise<User | null> {
    if (!this.$preloaded.users) {
      // @ts-expect-error - Lucid relation loading type issue
      await this.load('users')
    }
    return this.users.find((u) => u.$extras.pivot_role === UserRole.Owner) ?? null
  }

  /**
   * Check if organization has enough credits for an operation
   */
  hasEnoughCredits(amount: number): boolean {
    return this.credits >= amount
  }

  /**
   * Deduct credits from organization and create a transaction record
   * This is called when audio is processed
   */
  async deductCredits(
    amount: number,
    description: string,
    userId: number,
    audioId?: number
  ): Promise<CreditTransaction> {
    if (!this.hasEnoughCredits(amount)) {
      throw new Error('Insufficient credits')
    }

    this.credits -= amount
    await this.save()

    const transaction = await CreditTransaction.create({
      userId,
      organizationId: this.id,
      amount: -amount,
      balanceAfter: this.credits,
      type: CreditTransactionType.Usage,
      description,
      audioId: audioId || null,
    })

    return transaction
  }

  /**
   * Add credits to organization (from reseller distribution)
   */
  async addCredits(
    amount: number,
    type: CreditTransactionType,
    description: string,
    userId: number
  ): Promise<CreditTransaction> {
    this.credits += amount
    await this.save()

    const transaction = await CreditTransaction.create({
      userId,
      organizationId: this.id,
      amount: amount,
      balanceAfter: this.credits,
      type,
      description,
    })

    return transaction
  }

  // Subscription methods

  /**
   * Check if subscription is active (enabled and not paused)
   */
  get isSubscriptionActive(): boolean {
    return this.subscriptionEnabled && this.subscriptionPausedAt === null
  }

  /**
   * Calculate credits needed to reach the monthly target
   * Returns 0 if current credits are already at or above target
   */
  getCreditsNeededForRenewal(): number {
    if (!this.monthlyCreditsTarget) {
      return 0
    }
    return Math.max(0, this.monthlyCreditsTarget - this.credits)
  }

  /**
   * Calculate the next renewal date based on renewal type
   * @param fromDate Optional date to calculate from (defaults to now)
   */
  calculateNextRenewalDate(fromDate?: DateTime): DateTime | null {
    if (!this.renewalType) {
      return null
    }

    const now = fromDate || DateTime.now()

    if (this.renewalType === 'first_of_month') {
      // Next first day of month
      const nextMonth = now.plus({ months: 1 }).startOf('month')
      return nextMonth
    }

    if (this.renewalType === 'anniversary' && this.renewalDay) {
      // Next occurrence of the renewal day
      const currentDay = now.day
      const renewalDay = Math.min(this.renewalDay, 28) // Cap at 28 to avoid month issues

      if (currentDay < renewalDay) {
        // Renewal day is later this month
        return now.set({ day: renewalDay }).startOf('day')
      } else {
        // Renewal day has passed, move to next month
        const nextMonth = now.plus({ months: 1 })
        const maxDay = nextMonth.daysInMonth ?? 28
        return nextMonth.set({ day: Math.min(renewalDay, maxDay) }).startOf('day')
      }
    }

    return null
  }

  /**
   * Check if subscription is due for renewal
   */
  isDueForRenewal(): boolean {
    if (!this.isSubscriptionActive || !this.nextRenewalAt) {
      return false
    }
    return this.nextRenewalAt <= DateTime.now()
  }
}
