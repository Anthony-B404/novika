import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Organization from './organization.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export enum UserRole {
  Owner = 1,
  Administrator = 2,
  Member = 3,
}

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare firstName: string | null

  @column()
  declare lastName: string | null

  @column()
  declare email: string

  @column()
  declare googleId: string | null

  @column()
  declare avatar: string | null

  @column()
  declare role: UserRole

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare organizationId: number

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @column()
  declare onboardingCompleted: boolean

  @column()
  declare magicLinkToken: string | null

  @column.dateTime()
  declare magicLinkExpiresAt: DateTime | null

  @column()
  declare pendingEmail: string | null

  @column()
  declare emailChangeToken: string | null

  @column.dateTime()
  declare emailChangeExpiresAt: DateTime | null

  declare isCurrentUser?: boolean

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
