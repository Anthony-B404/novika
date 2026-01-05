<script setup lang="ts">
const { t } = useI18n();

definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: t("seo.legal.title"),
  description: t("seo.legal.description"),
});
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold">{{ $t("legal.title") }}</h1>

    <div class="prose prose-sm dark:prose-invert">
      <p class="text-muted mb-4">
        {{ $t("legal.lastUpdated") }}
      </p>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">{{ $t("legal.sections.publisher.title") }}</h2>
        <p>{{ $t("legal.sections.publisher.content") }}</p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">{{ $t("legal.sections.hosting.title") }}</h2>
        <p>{{ $t("legal.sections.hosting.content") }}</p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">{{ $t("legal.sections.intellectualProperty.title") }}</h2>
        <p>{{ $t("legal.sections.intellectualProperty.content") }}</p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">{{ $t("legal.sections.contact.title") }}</h2>
        <p>{{ $t("legal.sections.contact.content") }}</p>
      </section>
    </div>

    <div class="mt-8 flex gap-4">
      <UButton
        :to="$localePath('index')"
        variant="ghost"
        icon="i-lucide-arrow-left"
      >
        {{ $t("legal.backToHome") }}
      </UButton>
      <UButton
        :to="$localePath('terms')"
        variant="link"
      >
        {{ $t("legal.termsLink") }}
      </UButton>
    </div>
  </div>
</template>
