import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import DeletionRequest, { DeletionRequestStatus } from '#models/deletion_request'

/**
 * Middleware to check if user has a pending account deletion request.
 * If so, deny access to most routes except GDPR-related ones.
 */
export default class PendingDeletionMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    // If not authenticated, let the auth middleware handle it
    if (!user) {
      return next()
    }

    // Check for pending deletion request
    const deletionRequest = await DeletionRequest.query()
      .where('userId', user.id)
      .where('status', DeletionRequestStatus.Pending)
      .first()

    if (deletionRequest) {
      return ctx.response.forbidden({
        code: 'ACCOUNT_PENDING_DELETION',
        message: ctx.i18n.t('messages.gdpr.account_pending_deletion'),
        deletionRequest: {
          scheduledFor: deletionRequest.scheduledFor.toISO(),
          daysRemaining: deletionRequest.getDaysRemaining(),
        },
      })
    }

    return next()
  }
}
