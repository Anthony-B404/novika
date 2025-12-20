import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Organization from './organization.js'
import User from './user.js'
import Document from './document.js'

export enum TemplateCategory {
  Medical = 'medical',
  Legal = 'legal',
  Commercial = 'commercial',
  General = 'general',
}

/**
 * Section definition for template schema
 */
export interface TemplateSection {
  id: string
  label: string
  type: 'text' | 'textarea' | 'list' | 'date' | 'number'
  required?: boolean
  placeholder?: string
  description?: string
}

/**
 * Template schema structure
 */
export interface TemplateSchema {
  sections: TemplateSection[]
}

export default class Template extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare organizationId: number | null

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare category: TemplateCategory

  @column()
  declare schema: TemplateSchema

  @column()
  declare isDefault: boolean

  @column()
  declare createdBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
  })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => Document)
  declare documents: HasMany<typeof Document>

  // Helper methods

  /**
   * Check if this is a system-wide template (no organization)
   */
  isSystemTemplate(): boolean {
    return this.organizationId === null
  }

  /**
   * Check if this is a custom organization template
   */
  isCustomTemplate(): boolean {
    return this.organizationId !== null
  }

  /**
   * Get section count
   */
  getSectionCount(): number {
    return this.schema?.sections?.length ?? 0
  }

  /**
   * Get section by ID
   */
  getSection(sectionId: string): TemplateSection | undefined {
    return this.schema?.sections?.find((s) => s.id === sectionId)
  }

  /**
   * Get required sections
   */
  getRequiredSections(): TemplateSection[] {
    return this.schema?.sections?.filter((s) => s.required) ?? []
  }

  /**
   * Get category display name (localized key)
   */
  getCategoryKey(): string {
    return `templates.categories.${this.category}`
  }
}
