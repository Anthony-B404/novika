import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Organization, { OrganizationStatus } from '#models/organization'

/**
 * Middleware to check organization status for authenticated users.
 * Blocks access for users whose current organization is suspended or deleted.
 *
 * This middleware should be applied AFTER auth middleware.
 * It only applies to organization users (not super admin or reseller admin).
 */
export default class OrganizationStatusMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, response, i18n } = ctx
    const user = auth.user

    // Skip if no user or user is super admin/reseller admin
    if (!user || user.isSuperAdmin || user.resellerId) {
      return next()
    }

    // Skip if user has no current organization
    if (!user.currentOrganizationId) {
      return next()
    }

    // Load current organization and check status
    const organization = await Organization.find(user.currentOrganizationId)

    if (!organization) {
      return next()
    }

    // Block access if organization is suspended
    if (organization.status === OrganizationStatus.Suspended) {
      return response.forbidden({
        code: 'ORGANIZATION_SUSPENDED',
        message: i18n.t('messages.organization_status.suspended'),
        suspendedAt: organization.suspendedAt?.toISO(),
        suspensionReason: organization.suspensionReason,
      })
    }

    // Block access if organization is deleted
    if (organization.status === OrganizationStatus.Deleted) {
      return response.forbidden({
        code: 'ORGANIZATION_DELETED',
        message: i18n.t('messages.organization_status.deleted'),
        deletedAt: organization.deletedAt?.toISO(),
        daysUntilPurge: organization.getDaysUntilPurge(),
      })
    }

    return next()
  }
}
