import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Super Admin middleware to protect /api/admin/* routes.
 * Only users with isSuperAdmin = true can access these routes.
 */
export default class SuperAdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    // If not authenticated, return unauthorized
    if (!user) {
      return ctx.response.unauthorized({
        message: ctx.i18n.t('messages.auth.unauthorized'),
      })
    }

    // Check if user is a Super Admin
    if (!user.isSuperAdmin) {
      return ctx.response.forbidden({
        code: 'NOT_SUPER_ADMIN',
        message: ctx.i18n.t('messages.admin.access_denied'),
      })
    }

    return next()
  }
}
