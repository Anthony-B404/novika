import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export enum DeletionRequestStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export interface OrphanOrgDecision {
  action: 'transfer' | 'delete'
  newOwnerId?: number
}

export interface OrphanOrgsDecision {
  [orgId: string]: OrphanOrgDecision
}

export default class DeletionRequest extends BaseModel {
  public static table = 'deletion_requests'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare token: string

  @column()
  declare status: DeletionRequestStatus

  @column.dateTime()
  declare requestedAt: DateTime

  @column.dateTime()
  declare scheduledFor: DateTime

  @column.dateTime()
  declare processedAt: DateTime | null

  @column.dateTime()
  declare cancelledAt: DateTime | null

  @column({
    prepare: (value: OrphanOrgsDecision | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | OrphanOrgsDecision | null) => {
      if (!value) return null
      if (typeof value === 'object') return value // Already parsed by PostgreSQL
      return JSON.parse(value)
    },
  })
  declare orphanOrgsDecision: OrphanOrgsDecision | null

  @column()
  declare deletionSummary: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Helper methods

  /**
   * Check if the deletion request is still pending
   */
  isPending(): boolean {
    return this.status === DeletionRequestStatus.Pending
  }

  /**
   * Check if the deletion request can be cancelled
   * Can only cancel if status is pending and not yet processed
   */
  canBeCancelled(): boolean {
    return this.isPending() && DateTime.now() < this.scheduledFor
  }

  /**
   * Check if the deletion request is ready to be processed
   */
  isReadyToProcess(): boolean {
    return this.isPending() && DateTime.now() >= this.scheduledFor
  }

  /**
   * Get the number of days remaining before deletion
   */
  getDaysRemaining(): number {
    if (!this.isPending()) return 0
    const diff = this.scheduledFor.diff(DateTime.now(), 'days')
    return Math.max(0, Math.ceil(diff.days))
  }
}
