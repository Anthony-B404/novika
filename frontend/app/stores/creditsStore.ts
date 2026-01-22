import { defineStore } from 'pinia'
import type {
  CreditTransaction,
  CreditsBalanceResponse,
  CreditsHistoryResponse,
  CreditMode,
  CreditModeResponse,
  UpdateCreditModeResponse,
  UserCreditBalance,
  MemberCreditsResponse,
  MemberCreditDetailResponse,
  DistributeCreditsRequest,
  DistributeCreditsResponse,
  RecoverCreditsRequest,
  RecoverCreditsResponse,
  AutoRefillConfig,
  AutoRefillConfigResponse,
  GlobalAutoRefillConfig,
  GlobalAutoRefillResponse,
  GlobalAutoRefillConfigResponse,
  UserCreditHistoryResponse,
} from '~/types/credit'
import type { ApiError } from '~/types'

export const useCreditsStore = defineStore('credits', () => {
  const { authenticatedFetch } = useAuth()

  // State
  const credits = ref<number>(0)
  const creditMode = ref<CreditMode>('shared')
  const organizationCredits = ref<number>(0)
  const transactions = ref<CreditTransaction[]>([])
  const memberCredits = ref<UserCreditBalance[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Global auto-refill state
  const globalAutoRefillEnabled = ref<boolean>(false)
  const globalAutoRefillDefaultAmount = ref<number | null>(null)
  const globalAutoRefillDefaultDay = ref<number | null>(null)

  // Computed
  const isSharedMode = computed(() => creditMode.value === 'shared')
  const isIndividualMode = computed(() => creditMode.value === 'individual')
  const isGlobalAutoRefillActive = computed(
    () =>
      globalAutoRefillEnabled.value &&
      globalAutoRefillDefaultAmount.value !== null &&
      globalAutoRefillDefaultAmount.value > 0 &&
      globalAutoRefillDefaultDay.value !== null &&
      globalAutoRefillDefaultDay.value >= 1 &&
      globalAutoRefillDefaultDay.value <= 28,
  )

  /**
   * Fetch current credit balance, mode, and organization credits
   */
  async function fetchBalance() {
    loading.value = true
    error.value = null

    try {
      const response = (await authenticatedFetch('/credits')) as CreditsBalanceResponse
      credits.value = response.credits
      creditMode.value = response.mode
      organizationCredits.value = response.organizationCredits
      return response
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to fetch credits'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error fetching credit balance:', e)
      return null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Fetch credit mode
   */
  async function fetchMode(): Promise<CreditMode | null> {
    loading.value = true
    error.value = null

    try {
      const response = (await authenticatedFetch('/credits/mode')) as CreditModeResponse
      creditMode.value = response.mode
      organizationCredits.value = response.organizationCredits
      return response.mode
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to fetch credit mode'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error fetching credit mode:', e)
      return null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Update credit mode (Owner only)
   */
  async function updateMode(mode: CreditMode): Promise<UpdateCreditModeResponse | null> {
    loading.value = true
    error.value = null

    try {
      const response = (await authenticatedFetch('/credits/mode', {
        method: 'PUT',
        body: { mode },
      })) as UpdateCreditModeResponse
      creditMode.value = response.mode
      organizationCredits.value = response.organizationCredits
      return response
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to update credit mode'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error updating credit mode:', e)
      throw e
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Fetch member credits (mode individual, Owner/Admin)
   */
  async function fetchMemberCredits(): Promise<UserCreditBalance[] | null> {
    loading.value = true
    error.value = null

    try {
      const response = (await authenticatedFetch('/credits/members')) as MemberCreditsResponse
      memberCredits.value = response.data
      creditMode.value = response.mode
      return response.data
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to fetch member credits'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error fetching member credits:', e)
      return null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Get member credit details
   */
  async function getMemberCredits(userId: number): Promise<MemberCreditDetailResponse | null> {
    loading.value = true
    error.value = null

    try {
      const response = (await authenticatedFetch(
        `/credits/members/${userId}`,
      )) as MemberCreditDetailResponse
      return response
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to fetch member credits'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error fetching member credits:', e)
      return null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Get member credit transaction history
   */
  async function getMemberHistory(
    userId: number,
    page = 1,
    limit = 20,
  ): Promise<UserCreditHistoryResponse | null> {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      const response = (await authenticatedFetch(
        `/credits/members/${userId}/history?${params}`,
      )) as UserCreditHistoryResponse
      return response
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to fetch member history'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error fetching member history:', e)
      return null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Distribute credits to a member (Owner/Admin)
   */
  async function distributeCredits(
    data: DistributeCreditsRequest,
  ): Promise<DistributeCreditsResponse | null> {
    loading.value = true
    error.value = null

    try {
      const response = (await authenticatedFetch('/credits/distribute', {
        method: 'POST',
        body: data,
      })) as DistributeCreditsResponse

      organizationCredits.value = response.organizationCredits

      // Update member balance in local state
      const memberIndex = memberCredits.value.findIndex((m) => m.userId === data.userId)
      const member = memberCredits.value[memberIndex]
      if (member) {
        member.balance = response.userBalance
      }

      return response
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to distribute credits'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error distributing credits:', e)
      throw e
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Recover credits from a member (Owner only)
   */
  async function recoverCredits(
    data: RecoverCreditsRequest,
  ): Promise<RecoverCreditsResponse | null> {
    loading.value = true
    error.value = null

    try {
      const response = (await authenticatedFetch('/credits/recover', {
        method: 'POST',
        body: data,
      })) as RecoverCreditsResponse

      organizationCredits.value = response.organizationCredits

      // Update member balance in local state
      const memberIndex = memberCredits.value.findIndex((m) => m.userId === data.userId)
      const member = memberCredits.value[memberIndex]
      if (member) {
        member.balance = response.userBalance
      }

      return response
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to recover credits'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error recovering credits:', e)
      throw e
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Configure auto-refill for a member (Owner/Admin)
   */
  async function configureAutoRefill(
    userId: number,
    config: AutoRefillConfig,
  ): Promise<AutoRefillConfigResponse | null> {
    loading.value = true
    error.value = null

    try {
      const response = (await authenticatedFetch(`/credits/members/${userId}/auto-refill`, {
        method: 'PUT',
        body: config,
      })) as AutoRefillConfigResponse

      // Update member auto-refill settings in local state
      const memberIndex = memberCredits.value.findIndex((m) => m.userId === userId)
      const member = memberCredits.value[memberIndex]
      if (member) {
        member.autoRefillEnabled = response.autoRefillEnabled
        member.autoRefillAmount = response.autoRefillAmount
        member.autoRefillDay = response.autoRefillDay
      }

      return response
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to configure auto-refill'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error configuring auto-refill:', e)
      throw e
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Disable auto-refill for a member (Owner/Admin)
   */
  async function disableAutoRefill(userId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await authenticatedFetch(`/credits/members/${userId}/auto-refill`, {
        method: 'DELETE',
      })

      // Update member auto-refill settings in local state
      const memberIndex = memberCredits.value.findIndex((m) => m.userId === userId)
      const member = memberCredits.value[memberIndex]
      if (member) {
        member.autoRefillEnabled = false
        member.autoRefillAmount = null
        member.autoRefillDay = null
      }
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to disable auto-refill'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error disabling auto-refill:', e)
      throw e
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Fetch global auto-refill settings (Organization level, Owner only)
   */
  async function fetchGlobalAutoRefill(): Promise<GlobalAutoRefillResponse | null> {
    loading.value = true
    error.value = null

    try {
      const response = (await authenticatedFetch('/credits/auto-refill')) as GlobalAutoRefillResponse
      globalAutoRefillEnabled.value = response.enabled
      globalAutoRefillDefaultAmount.value = response.defaultAmount
      globalAutoRefillDefaultDay.value = response.defaultDay
      return response
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to fetch global auto-refill settings'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error fetching global auto-refill settings:', e)
      return null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Configure global auto-refill settings (Organization level, Owner only)
   */
  async function configureGlobalAutoRefill(
    config: GlobalAutoRefillConfig,
  ): Promise<GlobalAutoRefillConfigResponse | null> {
    loading.value = true
    error.value = null

    try {
      const response = (await authenticatedFetch('/credits/auto-refill', {
        method: 'PUT',
        body: config,
      })) as GlobalAutoRefillConfigResponse

      globalAutoRefillEnabled.value = response.enabled
      globalAutoRefillDefaultAmount.value = response.defaultAmount
      globalAutoRefillDefaultDay.value = response.defaultDay

      return response
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to configure global auto-refill'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error configuring global auto-refill:', e)
      throw e
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Disable global auto-refill (Organization level, Owner only)
   */
  async function disableGlobalAutoRefill(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await authenticatedFetch('/credits/auto-refill', {
        method: 'DELETE',
      })

      globalAutoRefillEnabled.value = false
      globalAutoRefillDefaultAmount.value = null
      globalAutoRefillDefaultDay.value = null
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to disable global auto-refill'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error disabling global auto-refill:', e)
      throw e
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Fetch credit transaction history
   */
  async function fetchHistory(page = 1, limit = 20, type?: string) {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (type) {
        params.set('type', type)
      }

      const response = (await authenticatedFetch(
        `/credits/history?${params}`,
      )) as CreditsHistoryResponse
      transactions.value = response.data
      return response
    }
    catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.message || 'Failed to fetch credit history'
      // eslint-disable-next-line no-console -- Debug logging
      console.error('Error fetching credit history:', e)
      return null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Refresh credits (call after audio processing)
   */
  async function refresh() {
    await fetchBalance()
  }

  return {
    // State
    credits,
    creditMode,
    organizationCredits,
    transactions,
    memberCredits,
    loading,
    error,
    globalAutoRefillEnabled,
    globalAutoRefillDefaultAmount,
    globalAutoRefillDefaultDay,

    // Computed
    isSharedMode,
    isIndividualMode,
    isGlobalAutoRefillActive,

    // Actions
    fetchBalance,
    fetchMode,
    updateMode,
    fetchMemberCredits,
    getMemberCredits,
    getMemberHistory,
    distributeCredits,
    recoverCredits,
    configureAutoRefill,
    disableAutoRefill,
    fetchGlobalAutoRefill,
    configureGlobalAutoRefill,
    disableGlobalAutoRefill,
    fetchHistory,
    refresh,
  }
})
