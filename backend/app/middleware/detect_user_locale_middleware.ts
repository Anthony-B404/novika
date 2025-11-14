import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import i18nManager from '@adonisjs/i18n/services/main'

/**
 * Middleware to detect and set user locale based on Accept-Language header
 */
export default class DetectUserLocaleMiddleware {
  /**
   * Handle request
   */
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Get locale from Accept-Language header or use default
     */
    const supportedLocales = i18nManager.supportedLocales()
    const requestLocale = ctx.request.language(supportedLocales) || i18nManager.defaultLocale

    /**
     * Create i18n instance with detected locale
     */
    ctx.i18n = i18nManager.locale(requestLocale)

    /**
     * Continue to next middleware
     */
    return next()
  }
}
