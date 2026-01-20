<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: t('seo.cookies.title'),
  description: t('seo.cookies.description')
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold">
      {{ $t("cookies.title") }}
    </h1>

    <div class="prose prose-sm dark:prose-invert">
      <p class="text-muted mb-4">
        {{ $t("cookies.lastUpdated") }}
      </p>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">
          {{ $t("cookies.sections.what.title") }}
        </h2>
        <p>{{ $t("cookies.sections.what.content") }}</p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">
          {{ $t("cookies.sections.types.title") }}
        </h2>
        <p>{{ $t("cookies.sections.types.content") }}</p>
        <ul class="mt-2 list-disc pl-5 text-sm">
          <li><strong>{{ $t("cookies.sections.types.items.essential.name") }}</strong>: {{ $t("cookies.sections.types.items.essential.description") }}</li>
          <li><strong>{{ $t("cookies.sections.types.items.preferences.name") }}</strong>: {{ $t("cookies.sections.types.items.preferences.description") }}</li>
        </ul>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">
          {{ $t("cookies.sections.management.title") }}
        </h2>
        <p>{{ $t("cookies.sections.management.content") }}</p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">
          {{ $t("cookies.sections.thirdParty.title") }}
        </h2>
        <p>{{ $t("cookies.sections.thirdParty.content") }}</p>
      </section>
    </div>

    <div class="mt-8 flex gap-4">
      <UButton
        :to="$localePath('index')"
        variant="ghost"
        icon="i-lucide-arrow-left"
      >
        {{ $t("cookies.backToHome") }}
      </UButton>
      <UButton
        :to="$localePath('privacy-policy')"
        variant="link"
      >
        {{ $t("cookies.privacyLink") }}
      </UButton>
    </div>
  </div>
</template>
