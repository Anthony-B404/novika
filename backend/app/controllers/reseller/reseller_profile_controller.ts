import type { HttpContext } from '@adonisjs/core/http'

export default class ResellerProfileController {
  /**
   * Get reseller profile
   * GET /api/reseller/profile
   */
  async show({ response, reseller }: HttpContext) {
    // reseller is attached by middleware
    return response.ok({
      id: reseller!.id,
      name: reseller!.name,
      email: reseller!.email,
      phone: reseller!.phone,
      company: reseller!.company,
      siret: reseller!.siret,
      address: reseller!.address,
      creditBalance: reseller!.creditBalance,
      isActive: reseller!.isActive,
      createdAt: reseller!.createdAt,
    })
  }
}
