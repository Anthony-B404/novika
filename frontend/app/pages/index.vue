<script setup lang="ts">
const { t } = useI18n()

const page = computed(() => ({
  title: t('home.title'),
  description: t('home.description'),
  hero: {
    links: [
      { label: t('home.getStarted'), to: '/login', icon: 'i-lucide-arrow-right', trailing: true },
      { label: t('home.viewPricing'), to: '/pricing', color: 'neutral', variant: 'subtle' }
    ]
  },
  features: {
    title: t('home.features.title'),
    description: t('home.features.description'),
    items: [
      {
        title: t('home.features.fastDevelopment.title'),
        description: t('home.features.fastDevelopment.description'),
        icon: 'i-lucide-zap'
      },
      {
        title: t('home.features.responsive.title'),
        description: t('home.features.responsive.description'),
        icon: 'i-lucide-smartphone'
      },
      {
        title: t('home.features.seo.title'),
        description: t('home.features.seo.description'),
        icon: 'i-lucide-search'
      },
      {
        title: t('home.features.customization.title'),
        description: t('home.features.customization.description'),
        icon: 'i-lucide-palette'
      }
    ]
  }
}))

useSeoMeta({
  titleTemplate: '',
  title: page.value.title,
  ogTitle: page.value.title,
  description: page.value.description,
  ogDescription: page.value.description
})
</script>

<template>
  <div>
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.hero.links"
    >
      <template #top>
        <HeroBackground />
      </template>
    </UPageHero>

    <UPageSection
      :title="page.features.title"
      :description="page.features.description"
    >
      <UPageGrid>
        <UPageCard
          v-for="(item, index) in page.features.items"
          :key="index"
          v-bind="item"
        />
      </UPageGrid>
    </UPageSection>
  </div>
</template>
