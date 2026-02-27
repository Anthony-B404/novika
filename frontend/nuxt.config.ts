/// <reference types="node" />
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-04-03',
  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#7c3aed' },
        { property: 'og:site_name', content: 'Novika' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    }
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@nuxt/ui > prosemirror-state',
        '@nuxt/ui > prosemirror-transform',
        '@nuxt/ui > prosemirror-model',
        '@nuxt/ui > prosemirror-view',
        '@nuxt/ui > prosemirror-gapcursor'
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL,
      notificationPollingInterval: parseInt(process.env.NOTIFICATION_POLLING_INTERVAL || '60000')
    }
  },
  alias: {
    '@': fileURLToPath(new URL('./app', import.meta.url))
  },
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@formkit/auto-animate/nuxt'
  ],
  routeRules: {
    '/': { prerender: true }
  },
  i18n: {
    strategy: 'prefix_and_default',
    langDir: 'locales',
    defaultLocale: 'fr',
    locales: [
      {
        code: 'fr',
        file: 'fr.json'
      },
      {
        code: 'en',
        file: 'en.json'
      }
    ],
    vueI18n: './i18n/i18n.config.ts'
  },
  colorMode: {
    classSuffix: ''
  }
})
