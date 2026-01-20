/**
 * Composable for common formatting functions
 * Centralized date and number formatting with locale support
 */
export function useFormatters () {
  const { locale } = useI18n()

  /**
   * Format a date string to localized format
   * @param dateString - ISO date string
   * @param options - Intl.DateTimeFormatOptions (optional)
   */
  function formatDate (
    dateString: string,
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  ) {
    return new Date(dateString).toLocaleDateString(locale.value, options)
  }

  /**
   * Format a date string to localized format with time
   * @param dateString - ISO date string
   */
  function formatDateTime (dateString: string) {
    return new Date(dateString).toLocaleDateString(locale.value, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Format a number with locale-specific grouping
   * @param amount - Number to format
   */
  function formatNumber (amount: number) {
    return new Intl.NumberFormat(locale.value).format(amount)
  }

  /**
   * Format credits amount
   * @param credits - Credit amount to format
   */
  function formatCredits (credits: number) {
    return new Intl.NumberFormat(locale.value).format(credits)
  }

  return {
    formatDate,
    formatDateTime,
    formatNumber,
    formatCredits
  }
}
