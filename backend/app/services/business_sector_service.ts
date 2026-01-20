import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BusinessSector } from '#models/organization'
import type PromptCategory from '#models/prompt_category'
import type Prompt from '#models/prompt'

/**
 * Service for business sector-related operations.
 * Centralizes sector sorting logic to avoid duplication across controllers.
 */
export default class BusinessSectorService {
  /**
   * Apply sector-based sorting to a PromptCategory query.
   *
   * Categories are sorted by:
   * - 0 = matching organization's sectors
   * - 1 = null (general categories like "Général")
   * - 2 = other sectors
   *
   * @param query - The Lucid query builder for PromptCategory
   * @param organizationSectors - Array of sectors from the organization
   */
  static applyCategorySorting(
    query: ModelQueryBuilderContract<typeof PromptCategory>,
    organizationSectors: BusinessSector[]
  ): void {
    if (organizationSectors.length > 0) {
      query.orderByRaw(
        `
        CASE
          WHEN business_sector = ANY(ARRAY[${organizationSectors.map(() => '?').join(', ')}]::varchar[]) THEN 0
          WHEN business_sector IS NULL THEN 1
          ELSE 2
        END,
        sort_order ASC
      `,
        organizationSectors
      )
    } else {
      // No sectors defined, prioritize null sectors (general) then order by sort_order
      query.orderByRaw(
        `
        CASE
          WHEN business_sector IS NULL THEN 0
          ELSE 1
        END,
        sort_order ASC
      `
      )
    }
  }

  /**
   * Apply sector-based sorting to a Prompt query (via category join).
   *
   * Prompts are sorted by their category's sector relevance:
   * - 0 = category matches organization's sectors
   * - 1 = category has null sector (general categories)
   * - 2 = category has other sectors
   *
   * @param query - The Lucid query builder for Prompt
   * @param organizationSectors - Array of sectors from the organization
   */
  static applyPromptSorting(
    query: ModelQueryBuilderContract<typeof Prompt>,
    organizationSectors: BusinessSector[]
  ): void {
    // Join with prompt_categories to access business_sector
    // Select only prompts columns to avoid conflicts
    query
      .select('prompts.*')
      .leftJoin('prompt_categories', 'prompts.category_id', 'prompt_categories.id')

    if (organizationSectors.length > 0) {
      query.orderByRaw(
        `
        CASE
          WHEN prompt_categories.business_sector = ANY(ARRAY[${organizationSectors.map(() => '?').join(', ')}]::varchar[]) THEN 0
          WHEN prompt_categories.business_sector IS NULL THEN 1
          ELSE 2
        END,
        prompts.sort_order ASC
      `,
        organizationSectors
      )
    } else {
      // No sectors defined, prioritize null sectors (general) then order by sort_order
      query.orderByRaw(
        `
        CASE
          WHEN prompt_categories.business_sector IS NULL THEN 0
          ELSE 1
        END,
        prompts.sort_order ASC
      `
      )
    }
  }
}
