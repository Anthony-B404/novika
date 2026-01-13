export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

/**
 * Format a date string to localized format
 */
export function formatDate(
  dateString: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
  return new Date(dateString).toLocaleDateString(locale, options || defaultOptions)
}

/**
 * Format a date string to localized format with time
 */
export function formatDateTime(
  dateString: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return new Date(dateString).toLocaleDateString(locale, options || defaultOptions)
}

/**
 * Build URL search params from object
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.set(key, String(value))
    }
  })
  return urlParams.toString()
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'data' in e) {
    const fetchError = e as { data?: { message?: string } }
    return fetchError.data?.message || fallback
  }
  if (e instanceof Error) {
    return e.message
  }
  return fallback
}
