import { defineStore } from 'pinia'
import { BUSINESS_SECTORS } from '~/types/reseller'

/**
 * Config Store
 * Manages application configuration data fetched from the backend.
 * Provides fallback to static values when API is unavailable.
 */
export const useConfigStore = defineStore('config', {
  state: () => ({
    /** Business sectors fetched from API */
    sectors: [] as string[],
    /** Whether the config has been loaded from API */
    isLoaded: false,
    /** Whether there was an error fetching config */
    hasError: false
  }),

  getters: {
    /**
     * Get available business sectors.
     * Returns API sectors if loaded, otherwise falls back to static constants.
     */
    availableSectors: (state): string[] => {
      if (state.isLoaded && state.sectors.length > 0) {
        return state.sectors
      }
      // Fallback to static constants if API failed or not yet loaded
      return BUSINESS_SECTORS
    }
  },

  actions: {
    /**
     * Fetch business sectors from the backend API.
     * Sets fallback flag on error for graceful degradation.
     */
    async fetchSectors () {
      try {
        const api = useApi()
        const response = await api<{ sectors: string[] }>('/api/config/sectors')
        this.sectors = response.sectors
        this.isLoaded = true
        this.hasError = false
      } catch (error) {
        console.warn('[config] Failed to fetch sectors from API, using static fallback:', error)
        this.hasError = true
        // Keep using static fallback via getter
      }
    }
  }
})
