import type { ApiErrorResponse } from '~/types/admin'

interface FetchErrorLike {
  data?: ApiErrorResponse
}

/**
 * Extract error message from fetch error
 * Prioritizes validation error messages over generic API messages
 */
export function getErrorMessage (e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'data' in e) {
    const fetchError = e as FetchErrorLike

    // Priority 1: First validation error message (already translated by VineJS)
    const validationErrors = fetchError.data?.errors
    const firstError = Array.isArray(validationErrors) ? validationErrors[0] : undefined
    if (firstError?.message) {
      return firstError.message
    }

    // Priority 2: Generic API message
    if (fetchError.data?.message) {
      return fetchError.data.message
    }
  }

  if (e instanceof Error) {
    return e.message
  }

  return fallback
}
