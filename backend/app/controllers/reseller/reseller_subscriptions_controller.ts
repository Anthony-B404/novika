import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import { DateTime } from 'luxon'
import Organization from '#models/organization'
import {
  configureSubscriptionValidator,
  listUpcomingRenewalsValidator,
} from '#validators/subscription'

export default class ResellerSubscriptionsController {
  /**
   * Get subscription status for an organization
   * GET /api/reseller/organizations/:id/subscription
   */
  async show({ params, response, reseller, i18n }: HttpContext) {
    const organization = await Organization.find(params.id)

    if (!organization) {
      return response.notFound({
        message: i18n.t('messages.organization.not_found'),
      })
    }

    // Policy check: organization must belong to reseller
    if (organization.resellerId !== reseller!.id) {
      return response.forbidden({
        message: i18n.t('messages.reseller_api.organization_access_denied'),
      })
    }

    return response.ok({
      subscriptionEnabled: organization.subscriptionEnabled,
      monthlyCreditsTarget: organization.monthlyCreditsTarget,
      renewalType: organization.renewalType,
      renewalDay: organization.renewalDay,
      subscriptionCreatedAt: organization.subscriptionCreatedAt,
      subscriptionPausedAt: organization.subscriptionPausedAt,
      lastRenewalAt: organization.lastRenewalAt,
      nextRenewalAt: organization.nextRenewalAt,
      isActive: organization.isSubscriptionActive,
      creditsNeededForRenewal: organization.getCreditsNeededForRenewal(),
      currentCredits: organization.credits,
    })
  }

  /**
   * Configure subscription for an organization
   * PUT /api/reseller/organizations/:id/subscription
   */
  async update({ params, request, response, reseller, i18n }: HttpContext) {
    const organization = await Organization.find(params.id)

    if (!organization) {
      return response.notFound({
        message: i18n.t('messages.organization.not_found'),
      })
    }

    // Policy check: organization must belong to reseller
    if (organization.resellerId !== reseller!.id) {
      return response.forbidden({
        message: i18n.t('messages.reseller_api.organization_access_denied'),
      })
    }

    try {
      const payload = await request.validateUsing(configureSubscriptionValidator)

      // Validate that required fields are present when enabling
      if (payload.enabled) {
        if (!payload.monthlyCreditsTarget) {
          return response.badRequest({
            message: i18n.t('messages.subscription.target_required'),
          })
        }
        if (!payload.renewalType) {
          return response.badRequest({
            message: i18n.t('messages.subscription.renewal_type_required'),
          })
        }
        if (payload.renewalType === 'anniversary' && !payload.renewalDay) {
          return response.badRequest({
            message: i18n.t('messages.subscription.renewal_day_required'),
          })
        }
      }

      const wasEnabled = organization.subscriptionEnabled
      const isNowEnabled = payload.enabled

      // Update subscription configuration
      organization.subscriptionEnabled = payload.enabled
      organization.monthlyCreditsTarget = payload.enabled ? payload.monthlyCreditsTarget ?? null : null
      organization.renewalType = payload.enabled ? payload.renewalType ?? null : null
      organization.renewalDay = payload.enabled ? payload.renewalDay ?? null : null

      // Handle subscription state changes
      if (!wasEnabled && isNowEnabled) {
        // Subscription being enabled for the first time or re-enabled
        organization.subscriptionCreatedAt = DateTime.now()
        organization.subscriptionPausedAt = null
        organization.nextRenewalAt = organization.calculateNextRenewalDate()
      } else if (wasEnabled && !isNowEnabled) {
        // Subscription being disabled
        organization.subscriptionPausedAt = null
        organization.nextRenewalAt = null
      } else if (isNowEnabled) {
        // Subscription still enabled but config changed - recalculate next renewal
        organization.nextRenewalAt = organization.calculateNextRenewalDate()
      }

      await organization.save()

      return response.ok({
        message: i18n.t('messages.subscription.updated'),
        subscription: {
          subscriptionEnabled: organization.subscriptionEnabled,
          monthlyCreditsTarget: organization.monthlyCreditsTarget,
          renewalType: organization.renewalType,
          renewalDay: organization.renewalDay,
          subscriptionCreatedAt: organization.subscriptionCreatedAt,
          subscriptionPausedAt: organization.subscriptionPausedAt,
          lastRenewalAt: organization.lastRenewalAt,
          nextRenewalAt: organization.nextRenewalAt,
          isActive: organization.isSubscriptionActive,
          creditsNeededForRenewal: organization.getCreditsNeededForRenewal(),
          currentCredits: organization.credits,
        },
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
   * Pause a subscription
   * POST /api/reseller/organizations/:id/subscription/pause
   */
  async pause({ params, response, reseller, i18n }: HttpContext) {
    const organization = await Organization.find(params.id)

    if (!organization) {
      return response.notFound({
        message: i18n.t('messages.organization.not_found'),
      })
    }

    // Policy check: organization must belong to reseller
    if (organization.resellerId !== reseller!.id) {
      return response.forbidden({
        message: i18n.t('messages.reseller_api.organization_access_denied'),
      })
    }

    if (!organization.subscriptionEnabled) {
      return response.badRequest({
        message: i18n.t('messages.subscription.not_enabled'),
      })
    }

    if (organization.subscriptionPausedAt) {
      return response.badRequest({
        message: i18n.t('messages.subscription.already_paused'),
      })
    }

    organization.subscriptionPausedAt = DateTime.now()
    await organization.save()

    return response.ok({
      message: i18n.t('messages.subscription.paused'),
      subscription: {
        subscriptionEnabled: organization.subscriptionEnabled,
        subscriptionPausedAt: organization.subscriptionPausedAt,
        isActive: organization.isSubscriptionActive,
      },
    })
  }

  /**
   * Resume a paused subscription
   * POST /api/reseller/organizations/:id/subscription/resume
   */
  async resume({ params, response, reseller, i18n }: HttpContext) {
    const organization = await Organization.find(params.id)

    if (!organization) {
      return response.notFound({
        message: i18n.t('messages.organization.not_found'),
      })
    }

    // Policy check: organization must belong to reseller
    if (organization.resellerId !== reseller!.id) {
      return response.forbidden({
        message: i18n.t('messages.reseller_api.organization_access_denied'),
      })
    }

    if (!organization.subscriptionEnabled) {
      return response.badRequest({
        message: i18n.t('messages.subscription.not_enabled'),
      })
    }

    if (!organization.subscriptionPausedAt) {
      return response.badRequest({
        message: i18n.t('messages.subscription.not_paused'),
      })
    }

    organization.subscriptionPausedAt = null
    organization.nextRenewalAt = organization.calculateNextRenewalDate()
    await organization.save()

    return response.ok({
      message: i18n.t('messages.subscription.resumed'),
      subscription: {
        subscriptionEnabled: organization.subscriptionEnabled,
        subscriptionPausedAt: organization.subscriptionPausedAt,
        nextRenewalAt: organization.nextRenewalAt,
        isActive: organization.isSubscriptionActive,
      },
    })
  }

  /**
   * Get upcoming renewals for all organizations (for alerts)
   * GET /api/reseller/subscriptions/upcoming
   */
  async upcoming({ request, response, reseller, i18n }: HttpContext) {
    try {
      const { days = 7 } = await request.validateUsing(listUpcomingRenewalsValidator)

      const now = DateTime.now()
      const futureDate = now.plus({ days })

      // Get all active subscriptions due within the specified days
      const organizations = await Organization.query()
        .where('reseller_id', reseller!.id)
        .where('subscription_enabled', true)
        .whereNull('subscription_paused_at')
        .where('next_renewal_at', '<=', futureDate.toSQL())
        .orderBy('next_renewal_at', 'asc')

      // Calculate total credits needed
      let totalCreditsNeeded = 0
      const renewals = organizations.map((org) => {
        const creditsNeeded = org.getCreditsNeededForRenewal()
        totalCreditsNeeded += creditsNeeded
        return {
          id: org.id,
          name: org.name,
          nextRenewalAt: org.nextRenewalAt,
          currentCredits: org.credits,
          monthlyCreditsTarget: org.monthlyCreditsTarget,
          creditsNeeded,
        }
      })

      const resellerBalance = reseller!.creditBalance
      const hasSufficientCredits = resellerBalance >= totalCreditsNeeded

      return response.ok({
        renewals,
        summary: {
          count: renewals.length,
          totalCreditsNeeded,
          resellerBalance,
          hasSufficientCredits,
          shortfall: hasSufficientCredits ? 0 : totalCreditsNeeded - resellerBalance,
        },
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
