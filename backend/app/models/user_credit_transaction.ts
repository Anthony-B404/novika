import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from './user.js'
import Organization from './organization.js'
import Audio from './audio.js'

export enum UserCreditTransactionType {
  Distribution = 'distribution',
  Recovery = 'recovery',
  Usage = 'usage',
  Refill = 'refill',
}

export default class UserCreditTransaction extends BaseModel {
  static table = 'user_credit_transactions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare organizationId: number

  @column()
  declare performedByUserId: number | null

  @column()
  declare amount: number

  @column()
  declare balanceAfter: number

  @column()
  declare type: UserCreditTransactionType

  @column()
  declare description: string | null

  @column()
  declare audioId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @belongsTo(() => User, { foreignKey: 'performedByUserId' })
  declare performedBy: BelongsTo<typeof User>

  @belongsTo(() => Audio)
  declare audio: BelongsTo<typeof Audio>
}
