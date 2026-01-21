import { useConfigStore } from '~/stores/config'

/**
 * Config plugin
 * Fetches application configuration (sectors) when the app starts.
 * Runs client-side only to ensure useApi() has access to i18n.
 * Uses graceful degradation - if API fails, static fallbacks are used.
 */
export default defineNuxtPlugin(async () => {
  const configStore = useConfigStore()

  try {
    await configStore.fetchSectors()
  } catch (_error) {
    // Error already logged in store, silent here
    // App continues with static fallback values
  }
})
