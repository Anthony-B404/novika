import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import Invitation from './invitation.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Organization extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare logo: string | null

  @column()
  declare email: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @hasMany(() => Invitation)
  declare invitations: HasMany<typeof Invitation>
}
