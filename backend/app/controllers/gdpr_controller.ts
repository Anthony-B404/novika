import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { errors } from '@vinejs/vine'
import env from '#start/env'
import gdprService from '#services/gdpr_service'
import gdprExportService from '#services/gdpr_export_service'
import DeletionRequest from '#models/deletion_request'
import { requestDeletionValidator, cancelDeletionValidator } from '#validators/gdpr'

export default class GdprController {
  /**
   * GET /api/gdpr/data-summary
   * Get a summary of all data stored for the current user
   */
  public async dataSummary({ auth, response, bouncer }: HttpContext) {
    const user = auth.user!

    await bouncer.with('GdprPolicy').authorize('viewDataSummary')

    const summary = await gdprService.getDataSummary(user)

    return response.ok(summary)
  }

  /**
   * GET /api/gdpr/export
   * Download a ZIP archive containing all user data
   */
  public async export({ auth, response, bouncer, i18n }: HttpContext) {
    const user = auth.user!

    await bouncer.with('GdprPolicy').authorize('exportData')

    try {
      const zipBuffer = await gdprExportService.generateExport(user)

      const filename = `dh-echo_export_${DateTime.now().toFormat('yyyy-MM-dd_HHmmss')}.zip`

      response.header('Content-Type', 'application/zip')
      response.header('Content-Disposition', `attachment; filename="${filename}"`)
      response.header('Content-Length', zipBuffer.length.toString())

      return response.send(zipBuffer)
    } catch (error) {
      console.error('GDPR export error:', error)
      return response.internalServerError({
        message: i18n.t('messages.gdpr.export.error'),
      })
    }
  }

  /**
   * GET /api/gdpr/orphan-organizations
   * Get organizations where user is the sole owner
   */
  public async orphanOrganizations({ auth, response, bouncer }: HttpContext) {
    const user = auth.user!

    await bouncer.with('GdprPolicy').authorize('viewDataSummary')

    const orphanOrgs = await gdprService.detectOrphanOrganizations(user)

    return response.ok(orphanOrgs)
  }

  /**
   * POST /api/gdpr/request-deletion
   * Request account deletion with 30-day delay
   */
  public async requestDeletion({ auth, request, response, bouncer, i18n }: HttpContext) {
    const user = auth.user!

    await bouncer.with('GdprPolicy').authorize('requestDeletion')

    try {
      const data = await request.validateUsing(requestDeletionValidator)

      const frontendUrl = env.get('FRONTEND_URL', 'http://localhost:3000')

      const deletionRequest = await gdprService.requestDeletion(
        user,
        data.orphanOrgsDecisions || [],
        i18n,
        frontendUrl
      )

      const scheduledDate = deletionRequest.scheduledFor
        .setLocale(i18n.locale)
        .toLocaleString(DateTime.DATE_FULL)

      return response.ok({
        message: i18n.t('messages.gdpr.deletion.requested', { scheduledDate }),
        deletionRequest: {
          id: deletionRequest.id,
          status: deletionRequest.status,
          requestedAt: deletionRequest.requestedAt.toISO(),
          scheduledFor: deletionRequest.scheduledFor.toISO(),
          daysRemaining: deletionRequest.getDaysRemaining(),
        },
      })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.status(422).json({
          message: i18n.t('messages.errors.validation_failed'),
          errors: error.messages,
        })
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage === 'DELETION_ALREADY_PENDING') {
        return response.badRequest({
          message: i18n.t('messages.gdpr.deletion.already_pending'),
        })
      }

      if (errorMessage === 'ORPHAN_ORGS_REQUIRED') {
        return response.badRequest({
          message: i18n.t('messages.gdpr.deletion.orphan_orgs_required'),
        })
      }

      if (errorMessage.startsWith('INVALID_NEW_OWNER:')) {
        return response.badRequest({
          message: i18n.t('messages.gdpr.deletion.invalid_new_owner'),
        })
      }

      console.error('GDPR deletion request error:', error)
      return response.internalServerError({
        message: i18n.t('messages.errors.server_error'),
      })
    }
  }

  /**
   * POST /api/gdpr/cancel-deletion
   * Cancel a pending deletion request
   */
  public async cancelDeletion({ auth, request, response, bouncer, i18n }: HttpContext) {
    const user = auth.user!

    try {
      const data = await request.validateUsing(cancelDeletionValidator)

      // Find the deletion request
      const deletionRequest = await DeletionRequest.query()
        .where('token', data.token)
        .where('userId', user.id)
        .first()

      if (!deletionRequest) {
        return response.badRequest({
          message: i18n.t('messages.gdpr.deletion.invalid_token'),
        })
      }

      await bouncer.with('GdprPolicy').authorize('cancelDeletion', deletionRequest)

      await gdprService.cancelDeletion(data.token, user.id)

      return response.ok({
        message: i18n.t('messages.gdpr.deletion.cancelled'),
      })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.status(422).json({
          message: i18n.t('messages.errors.validation_failed'),
          errors: error.messages,
        })
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage === 'INVALID_TOKEN') {
        return response.badRequest({
          message: i18n.t('messages.gdpr.deletion.invalid_token'),
        })
      }

      if (errorMessage === 'CANNOT_CANCEL') {
        return response.badRequest({
          message: i18n.t('messages.gdpr.deletion.cannot_cancel'),
        })
      }

      console.error('GDPR cancel deletion error:', error)
      return response.internalServerError({
        message: i18n.t('messages.errors.server_error'),
      })
    }
  }

  /**
   * GET /api/gdpr/deletion-status
   * Get the status of a pending deletion request
   */
  public async deletionStatus({ auth, response, bouncer, i18n }: HttpContext) {
    const user = auth.user!

    await bouncer.with('GdprPolicy').authorize('viewDeletionStatus')

    const deletionRequest = await gdprService.getDeletionStatus(user.id)

    if (!deletionRequest) {
      return response.ok({
        hasPendingRequest: false,
        deletionRequest: null,
      })
    }

    const scheduledDate = deletionRequest.scheduledFor
      .setLocale(i18n.locale)
      .toLocaleString(DateTime.DATE_FULL)

    return response.ok({
      hasPendingRequest: true,
      deletionRequest: {
        id: deletionRequest.id,
        status: deletionRequest.status,
        requestedAt: deletionRequest.requestedAt.toISO(),
        scheduledFor: deletionRequest.scheduledFor.toISO(),
        scheduledForFormatted: scheduledDate,
        daysRemaining: deletionRequest.getDaysRemaining(),
        canBeCancelled: deletionRequest.canBeCancelled(),
        token: deletionRequest.token,
      },
    })
  }
}
