import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import ResellerTransaction from '#models/reseller_transaction'
import { listTransactionsValidator } from '#validators/reseller'

export default class ResellerCreditsController {
  /**
   * Get reseller credit balance and transaction history
   * GET /api/reseller/credits
   */
  async index({ request, response, reseller, i18n }: HttpContext) {
    try {
      const { page = 1, limit = 20, type } = await request.validateUsing(listTransactionsValidator)

      const query = ResellerTransaction.query()
        .where('reseller_id', reseller!.id)
        .preload('targetOrganization', (q) => q.select(['id', 'name']))
        .orderBy('created_at', 'desc')

      if (type) {
        query.where('type', type)
      }

      const transactions = await query.paginate(page, limit)

      return response.ok({
        creditBalance: reseller!.creditBalance,
        transactions,
      })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: i18n.t('messages.errors.validation_failed'),
          errors: error.messages,
        })
      }
      throw error
    }
  }
}
