import type {
  SubscriptionStatus,
  ConfigureSubscriptionPayload,
  SubscriptionResponse,
  UpcomingRenewalsResponse,
} from '~/types/reseller'
import { getErrorMessage } from '~/utils/errors'

/**
 * Reseller Subscriptions composable
 * Provides subscription management operations for organizations (Reseller Admin only)
 */
export function useResellerSubscriptions() {
  const { authenticatedFetch } = useAuth()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // ==========================================================================
  // SUBSCRIPTION STATUS
  // ==========================================================================

  /**
   * Fetch subscription status for an organization
   */
  async function fetchSubscription(organizationId: number): Promise<SubscriptionStatus | null> {
    loading.value = true
    error.value = null
    try {
      return await authenticatedFetch<SubscriptionStatus>(
        `/reseller/organizations/${organizationId}/subscription`
      )
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to fetch subscription')
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==========================================================================
  // SUBSCRIPTION CONFIGURATION
  // ==========================================================================

  /**
   * Configure subscription for an organization
   */
  async function configureSubscription(
    organizationId: number,
    payload: ConfigureSubscriptionPayload
  ): Promise<SubscriptionResponse | null> {
    loading.value = true
    error.value = null
    try {
      return await authenticatedFetch<SubscriptionResponse>(
        `/reseller/organizations/${organizationId}/subscription`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to configure subscription')
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Pause a subscription
   */
  async function pauseSubscription(organizationId: number): Promise<SubscriptionResponse | null> {
    loading.value = true
    error.value = null
    try {
      return await authenticatedFetch<SubscriptionResponse>(
        `/reseller/organizations/${organizationId}/subscription/pause`,
        {
          method: 'POST',
        }
      )
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to pause subscription')
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Resume a paused subscription
   */
  async function resumeSubscription(organizationId: number): Promise<SubscriptionResponse | null> {
    loading.value = true
    error.value = null
    try {
      return await authenticatedFetch<SubscriptionResponse>(
        `/reseller/organizations/${organizationId}/subscription/resume`,
        {
          method: 'POST',
        }
      )
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to resume subscription')
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==========================================================================
  // UPCOMING RENEWALS
  // ==========================================================================

  /**
   * Fetch upcoming renewals for alert display
   */
  async function fetchUpcomingRenewals(days: number = 7): Promise<UpcomingRenewalsResponse | null> {
    loading.value = true
    error.value = null
    try {
      return await authenticatedFetch<UpcomingRenewalsResponse>(
        `/reseller/subscriptions/upcoming?days=${days}`
      )
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to fetch upcoming renewals')
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    loading,
    error,

    // Subscription status
    fetchSubscription,

    // Subscription configuration
    configureSubscription,
    pauseSubscription,
    resumeSubscription,

    // Upcoming renewals
    fetchUpcomingRenewals,
  }
}
