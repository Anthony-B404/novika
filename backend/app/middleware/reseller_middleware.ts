import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Reseller from '#models/reseller'

/**
 * Reseller middleware to protect /api/reseller/* routes.
 * Only users with a valid resellerId can access these routes.
 */
export default class ResellerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    // If not authenticated, return unauthorized
    if (!user) {
      return ctx.response.unauthorized({
        message: ctx.i18n.t('messages.auth.unauthorized'),
      })
    }

    // Check if user is a Reseller Admin (has resellerId)
    if (!user.resellerId) {
      return ctx.response.forbidden({
        code: 'NOT_RESELLER_ADMIN',
        message: ctx.i18n.t('messages.reseller_api.access_denied'),
      })
    }

    // Load and check reseller is active
    const reseller = await Reseller.find(user.resellerId)
    if (!reseller || !reseller.isActive) {
      return ctx.response.forbidden({
        code: 'RESELLER_INACTIVE',
        message: ctx.i18n.t('messages.reseller_api.reseller_inactive'),
      })
    }

    // Attach reseller to context for easy access in controllers
    ctx.reseller = reseller

    return next()
  }
}

// Extend HttpContext to include reseller
declare module '@adonisjs/core/http' {
  interface HttpContext {
    reseller?: Reseller
  }
}
