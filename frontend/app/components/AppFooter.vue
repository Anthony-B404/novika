<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const currentYear = new Date().getFullYear()

const legalLinks = computed(() => [
  {
    label: t('layouts.default.footer.terms'),
    to: localePath('/terms')
  },
  {
    label: t('layouts.default.footer.privacy'),
    to: localePath('/privacy-policy')
  },
  {
    label: t('layouts.default.footer.cookies'),
    to: localePath('/cookies-policy')
  },
  {
    label: t('layouts.default.footer.legalNotice'),
    to: localePath('/legal-notice')
  }
])
</script>

<template>
  <footer class="relative z-10 mt-auto border-t border-gray-200 bg-white/50 py-6 backdrop-blur-sm dark:border-gray-800 dark:bg-slate-900/50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <!-- Copyright -->
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t("layouts.default.footer.copyright", { year: currentYear }) }}
        </p>

        <!-- Legal Links -->
        <nav class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <NuxtLink
            v-for="link in legalLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>
