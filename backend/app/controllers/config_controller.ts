import type { HttpContext } from '@adonisjs/core/http'
import { BUSINESS_SECTORS } from '#models/organization'

/**
 * Controller for application configuration endpoints.
 * Provides dynamic configuration data that can be consumed by the frontend.
 */
export default class ConfigController {
  /**
   * Get available business sectors.
   *
   * GET /api/config/sectors
   *
   * Returns the list of available business sectors that can be assigned to organizations.
   * This endpoint allows the frontend to dynamically fetch sectors rather than
   * duplicating the list, ensuring consistency when sectors are added/removed.
   */
  async sectors({ response }: HttpContext) {
    return response.ok({
      sectors: BUSINESS_SECTORS,
    })
  }
}
