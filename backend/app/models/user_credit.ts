import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from './user.js'
import Organization from './organization.js'

export default class UserCredit extends BaseModel {
  static table = 'user_credits'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare organizationId: number

  @column()
  declare balance: number

  @column()
  declare creditCap: number | null

  @column()
  declare autoRefillEnabled: boolean

  @column()
  declare autoRefillAmount: number | null

  @column()
  declare autoRefillDay: number | null

  @column.dateTime()
  declare lastRefillAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  /**
   * Check if user has enough credits for an operation
   */
  hasEnoughCredits(amount: number): boolean {
    return this.balance >= amount
  }

  /**
   * Check if user can receive additional credits without exceeding cap
   */
  canReceiveCredits(amount: number): boolean {
    if (this.creditCap === null) return true
    return this.balance + amount <= this.creditCap
  }

  /**
   * Get the maximum amount of credits that can be added (considering cap)
   */
  getMaxReceivableCredits(): number | null {
    if (this.creditCap === null) return null
    return Math.max(0, this.creditCap - this.balance)
  }

  /**
   * Calculate credits needed to reach auto-refill target.
   * autoRefillAmount is the TARGET balance, not the amount to add.
   * Like Organization.getCreditsNeededForRenewal()
   */
  getCreditsNeededForRefill(): number {
    if (!this.autoRefillAmount) {
      return 0
    }
    return Math.max(0, this.autoRefillAmount - this.balance)
  }
}
