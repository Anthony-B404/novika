import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Organization from './organization.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Invitation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare identifier: string

  @column()
  declare email: string

  @column()
  declare organizationId: number

  @column()
  declare expiresAt: DateTime

  @column()
  declare accepted: boolean

  @column()
  declare role: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>
}
