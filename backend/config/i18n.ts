import app from '@adonisjs/core/services/app'
import { defineConfig, loaders, formatters } from '@adonisjs/i18n'

const i18nConfig = defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Default locale
  |--------------------------------------------------------------------------
  |
  | The default locale to use when a specific locale is not defined during
  | a request or when using the i18n manager.
  |
  */
  defaultLocale: 'fr',

  /*
  |--------------------------------------------------------------------------
  | Fallback locales
  |--------------------------------------------------------------------------
  |
  | Fallback locales are used when a translation is missing for the current
  | locale. You can define multiple fallback locales, and they will be used
  | in order.
  |
  */
  fallbackLocales: ['fr'],

  /*
  |--------------------------------------------------------------------------
  | Supported locales
  |--------------------------------------------------------------------------
  |
  | The list of supported locales by your application.
  |
  */
  supportedLocales: ['fr', 'en'],

  /*
  |--------------------------------------------------------------------------
  | Formatter
  |--------------------------------------------------------------------------
  |
  | The formatter to use for formatting messages. The ICU formatter is
  | recommended as it supports pluralization and gender.
  |
  */
  formatter: formatters.icu(),

  /*
  |--------------------------------------------------------------------------
  | Loaders
  |--------------------------------------------------------------------------
  |
  | Loaders are used to load translations from different sources. You can
  | use multiple loaders and they will be merged together.
  |
  */
  loaders: [
    loaders.fs({
      location: app.languageFilesPath(),
    }),
  ],
})

export default i18nConfig

declare module '@adonisjs/i18n' {
  export interface I18nTranslations {}
}
