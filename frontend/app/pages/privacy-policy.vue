<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: t('seo.privacy.title'),
  description: t('seo.privacy.description')
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold">
      {{ $t("privacy.title") }}
    </h1>

    <div class="prose prose-sm dark:prose-invert">
      <p class="text-muted mb-4">
        {{ $t("privacy.lastUpdated") }}
      </p>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">
          {{ $t("privacy.sections.dataCollection.title") }}
        </h2>
        <p>{{ $t("privacy.sections.dataCollection.content") }}</p>
        <ul class="mt-2 list-disc pl-5 text-sm">
          <li>{{ $t("privacy.sections.dataCollection.items.account") }}</li>
          <li>{{ $t("privacy.sections.dataCollection.items.audio") }}</li>
          <li>{{ $t("privacy.sections.dataCollection.items.usage") }}</li>
        </ul>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">
          {{ $t("privacy.sections.dataUsage.title") }}
        </h2>
        <p>{{ $t("privacy.sections.dataUsage.content") }}</p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">
          {{ $t("privacy.sections.thirdParties.title") }}
        </h2>
        <p>{{ $t("privacy.sections.thirdParties.content") }}</p>
        <ul class="mt-2 list-disc pl-5 text-sm">
          <li>{{ $t("privacy.sections.thirdParties.items.mistral") }}</li>
          <li>{{ $t("privacy.sections.thirdParties.items.resend") }}</li>
        </ul>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">
          {{ $t("privacy.sections.dataRetention.title") }}
        </h2>
        <p>{{ $t("privacy.sections.dataRetention.content") }}</p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">
          {{ $t("privacy.sections.rights.title") }}
        </h2>
        <p>{{ $t("privacy.sections.rights.content") }}</p>
        <ul class="mt-2 list-disc pl-5 text-sm">
          <li>{{ $t("privacy.sections.rights.items.access") }}</li>
          <li>{{ $t("privacy.sections.rights.items.rectification") }}</li>
          <li>{{ $t("privacy.sections.rights.items.deletion") }}</li>
          <li>{{ $t("privacy.sections.rights.items.portability") }}</li>
          <li>{{ $t("privacy.sections.rights.items.opposition") }}</li>
        </ul>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">
          {{ $t("privacy.sections.contact.title") }}
        </h2>
        <p>{{ $t("privacy.sections.contact.content") }}</p>
      </section>
    </div>

    <div class="mt-8 flex gap-4">
      <UButton
        :to="$localePath('index')"
        variant="ghost"
        icon="i-lucide-arrow-left"
      >
        {{ $t("privacy.backToHome") }}
      </UButton>
      <UButton
        :to="$localePath('terms')"
        variant="link"
      >
        {{ $t("privacy.termsLink") }}
      </UButton>
    </div>
  </div>
</template>
