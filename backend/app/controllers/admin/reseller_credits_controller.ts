import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import Reseller, { InsufficientCreditsError } from '#models/reseller'
import ResellerTransaction from '#models/reseller_transaction'
import {
  addCreditsValidator,
  removeCreditsValidator,
  listTransactionsValidator,
} from '#validators/reseller'

export default class ResellerCreditsController {
  /**
   * Add credits to a reseller's pool.
   *
   * POST /admin/resellers/:id/credits
   */
  async addCredits({ params, request, response, auth, i18n }: HttpContext) {
    const reseller = await Reseller.find(params.id)

    if (!reseller) {
      return response.notFound({
        message: i18n.t('messages.reseller.not_found'),
      })
    }

    if (!reseller.isActive) {
      return response.badRequest({
        message: i18n.t('messages.reseller.inactive'),
      })
    }

    if (!auth.user) {
      return response.unauthorized({
        message: i18n.t('messages.auth.unauthorized'),
      })
    }

    try {
      const payload = await request.validateUsing(addCreditsValidator)
      const superAdmin = auth.user

      const transaction = await reseller.addCredits(
        payload.amount,
        payload.description || i18n.t('messages.reseller.credits_added_by_admin'),
        superAdmin.id
      )

      return response.created({
        message: i18n.t('messages.reseller.credits_added', { amount: payload.amount }),
        transaction,
        newBalance: reseller.creditBalance,
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

  /**
   * Remove credits from a reseller's pool.
   *
   * POST /admin/resellers/:id/credits/remove
   */
  async removeCredits({ params, request, response, auth, i18n }: HttpContext) {
    const reseller = await Reseller.find(params.id)

    if (!reseller) {
      return response.notFound({
        message: i18n.t('messages.reseller.not_found'),
      })
    }

    if (!reseller.isActive) {
      return response.badRequest({
        message: i18n.t('messages.reseller.inactive'),
      })
    }

    if (!auth.user) {
      return response.unauthorized({
        message: i18n.t('messages.auth.unauthorized'),
      })
    }

    try {
      const payload = await request.validateUsing(removeCreditsValidator)
      const superAdmin = auth.user

      // Check if reseller has enough credits
      if (!reseller.hasEnoughCredits(payload.amount)) {
        return response.badRequest({
          message: i18n.t('messages.reseller.insufficient_credits'),
        })
      }

      // Use adjustCredits with negative amount for removal
      const transaction = await reseller.adjustCredits(
        -payload.amount,
        payload.description || i18n.t('messages.reseller.credits_removed_by_admin'),
        superAdmin.id
      )

      return response.ok({
        message: i18n.t('messages.reseller.credits_removed', { amount: payload.amount }),
        transaction,
        newBalance: reseller.creditBalance,
      })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: i18n.t('messages.errors.validation_failed'),
          errors: error.messages,
        })
      }
      if (error instanceof InsufficientCreditsError) {
        return response.badRequest({
          message: i18n.t('messages.reseller.insufficient_credits'),
          code: error.code,
          available: error.available,
          requested: error.requested,
        })
      }
      throw error
    }
  }

  /**
   * Get transaction history for a reseller.
   *
   * GET /admin/resellers/:id/transactions
   */
  async transactions({ params, request, response, i18n }: HttpContext) {
    const reseller = await Reseller.find(params.id)

    if (!reseller) {
      return response.notFound({
        message: i18n.t('messages.reseller.not_found'),
      })
    }

    try {
      const { page = 1, limit = 20, type } = await request.validateUsing(listTransactionsValidator)

      const query = ResellerTransaction.query()
        .where('reseller_id', reseller.id)
        .preload('performedBy', (q) => q.select(['id', 'email', 'first_name', 'last_name']))
        .preload('targetOrganization', (q) => q.select(['id', 'name']))
        .orderBy('created_at', 'desc')

      if (type) {
        query.where('type', type)
      }

      const transactions = await query.paginate(page, limit)

      return response.ok({
        reseller: {
          id: reseller.id,
          name: reseller.name,
          creditBalance: reseller.creditBalance,
        },
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
