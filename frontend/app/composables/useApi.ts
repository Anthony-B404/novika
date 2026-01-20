/**
 * API Composable
 * Provides $fetch wrapper with automatic Accept-Language header
 * based on current i18n locale (reactive to locale changes)
 */
export const useApi = () => {
  const { $i18n } = useNuxtApp()
  const config = useRuntimeConfig()

  /**
   * Make API request with automatic Accept-Language header
   * @param url - API endpoint (relative or absolute)
   * @param options - Fetch options
   * @returns Promise with typed response
   */
  const apiFetch = async <T = any>(
    url: string,
    options: RequestInit & { baseURL?: string } = {}
  ): Promise<T> => {
    // Get current locale (reactive - always up to date)
    const locale = $i18n?.locale?.value || 'fr'

    // Construct full URL if needed
    const fullUrl = url.startsWith('http')
      ? url
      : `${options.baseURL || config.public.apiUrl}${url}`

    return await $fetch<T>(fullUrl, {
      ...options,
      headers: {
        'Accept-Language': locale,
        ...options.headers
      }
    })
  }

  return apiFetch
}
