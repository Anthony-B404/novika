import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export enum SubscriptionStatus {
  Active = 'active',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Paused = 'paused',
  PastDue = 'past_due',
  Unpaid = 'unpaid',
  OnTrial = 'on_trial',
}

export default class Subscription extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare lemonSqueezySubscriptionId: string

  @column()
  declare lemonSqueezyCustomerId: string

  @column()
  declare lemonSqueezyVariantId: string

  @column()
  declare status: SubscriptionStatus

  @column()
  declare cardBrand: string | null

  @column()
  declare cardLastFour: string | null

  @column.dateTime()
  declare currentPeriodEnd: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Check if subscription is currently active
   */
  isActive(): boolean {
    return this.status === SubscriptionStatus.Active || this.status === SubscriptionStatus.OnTrial
  }
}
