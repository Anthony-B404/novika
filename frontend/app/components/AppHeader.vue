<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const items = computed(() => [{
  label: t('nav.home'),
  to: '/'
}, {
  label: t('nav.pricing'),
  to: '/pricing'
}])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UColorModeButton />

      <UButton
        icon="i-lucide-log-in"
        color="neutral"
        variant="ghost"
        to="/login"
        class="lg:hidden"
      />

      <UButton
        :label="$t('nav.signIn')"
        color="neutral"
        variant="outline"
        to="/login"
        class="hidden lg:inline-flex"
      />

      <UButton
        :label="$t('nav.signUp')"
        color="neutral"
        trailing-icon="i-lucide-arrow-right"
        class="hidden lg:inline-flex"
        to="/signup"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <UButton
        :label="$t('nav.signIn')"
        color="neutral"
        variant="subtle"
        to="/login"
        block
        class="mb-3"
      />
      <UButton
        :label="$t('nav.signUp')"
        color="neutral"
        to="/signup"
        block
      />
    </template>
  </UHeader>
</template>
