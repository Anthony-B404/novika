import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Audio from './audio.js'
import Transcription from './transcription.js'
import Template from './template.js'

export enum DocumentStatus {
  Draft = 'draft',
  Completed = 'completed',
  Exported = 'exported',
}

export enum DocumentFormat {
  PDF = 'pdf',
  DOCX = 'docx',
}

/**
 * Section content in the generated document
 */
export interface DocumentSectionContent {
  sectionId: string
  label: string
  value: string | string[] | null
}

/**
 * Document content structure
 */
export interface DocumentContent {
  sections: DocumentSectionContent[]
  metadata?: {
    generatedAt?: string
    templateVersion?: number
    aiModel?: string
  }
}

export default class Document extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare audioId: number

  @column()
  declare transcriptionId: number

  @column()
  declare templateId: number | null

  @column()
  declare title: string

  @column()
  declare content: DocumentContent

  @column()
  declare status: DocumentStatus

  @column()
  declare filePath: string | null

  @column()
  declare format: DocumentFormat | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships

  @belongsTo(() => Audio)
  declare audio: BelongsTo<typeof Audio>

  @belongsTo(() => Transcription)
  declare transcription: BelongsTo<typeof Transcription>

  @belongsTo(() => Template)
  declare template: BelongsTo<typeof Template>

  // Helper methods

  /**
   * Check if document is a draft
   */
  isDraft(): boolean {
    return this.status === DocumentStatus.Draft
  }

  /**
   * Check if document has been exported
   */
  isExported(): boolean {
    return this.status === DocumentStatus.Exported
  }

  /**
   * Check if document is completed (ready for export)
   */
  isCompleted(): boolean {
    return this.status === DocumentStatus.Completed || this.status === DocumentStatus.Exported
  }

  /**
   * Get section content by ID
   */
  getSectionContent(sectionId: string): DocumentSectionContent | undefined {
    return this.content?.sections?.find((s) => s.sectionId === sectionId)
  }

  /**
   * Get section count
   */
  getSectionCount(): number {
    return this.content?.sections?.length ?? 0
  }

  /**
   * Check if export file exists
   */
  hasExportFile(): boolean {
    return this.filePath !== null && this.format !== null
  }

  /**
   * Get format display name
   */
  getFormatDisplayName(): string {
    switch (this.format) {
      case DocumentFormat.PDF:
        return 'PDF'
      case DocumentFormat.DOCX:
        return 'Word'
      default:
        return ''
    }
  }
}
