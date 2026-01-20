import { defineStore } from 'pinia'
import type { CreditTransaction, CreditsBalanceResponse, CreditsHistoryResponse } from '~/types/credit'

export const useCreditsStore = defineStore('credits', () => {
  const { authenticatedFetch } = useAuth()

  const credits = ref<number>(0)
  const transactions = ref<CreditTransaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
     * Fetch current credit balance
     */
  async function fetchBalance () {
    loading.value = true
    error.value = null

    try {
      const response = await authenticatedFetch('/credits') as CreditsBalanceResponse
      credits.value = response.credits
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch credits'
      console.error('Error fetching credit balance:', e)
    } finally {
      loading.value = false
    }
  }

  /**
     * Fetch credit transaction history
     */
  async function fetchHistory (page = 1, limit = 20, type?: string) {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      })
      if (type) { params.set('type', type) }

      const response = await authenticatedFetch(`/credits/history?${params}`) as CreditsHistoryResponse
      transactions.value = response.data
      return response
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch credit history'
      console.error('Error fetching credit history:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
     * Refresh credits (call after audio processing)
     */
  async function refresh () {
    await fetchBalance()
  }

  return {
    credits,
    transactions,
    loading,
    error,
    fetchBalance,
    fetchHistory,
    refresh
  }
})
