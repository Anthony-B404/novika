<script setup lang="ts">
const { t, tm } = useI18n()

const page = computed(() => {
  return {
    title: t('pricing.title'),
    description: t('pricing.description'),
    plans: [
      {
        name: t('pricing.plans.starter.name'),
        description: t('pricing.plans.starter.description'),
        price: { month: '$9', year: '$90' },
        features: tm('pricing.plans.starter.features') as string[],
        button: { label: t('pricing.plans.starter.button'), to: '/signup' }
      },
      {
        name: t('pricing.plans.pro.name'),
        description: t('pricing.plans.pro.description'),
        price: { month: '$29', year: '$290' },
        highlight: true,
        features: tm('pricing.plans.pro.features') as string[],
        button: { label: t('pricing.plans.pro.button'), to: '/signup' }
      },
      {
        name: t('pricing.plans.enterprise.name'),
        description: t('pricing.plans.enterprise.description'),
        price: { month: '$99', year: '$990' },
        features: tm('pricing.plans.enterprise.features') as string[],
        button: { label: t('pricing.plans.enterprise.button'), to: '/signup' }
      }
    ]
  }
})

useSeoMeta({
  title: page.value.title,
  ogTitle: page.value.title,
  description: page.value.description,
  ogDescription: page.value.description
})

const isYearly = ref('0')

const items = computed(() => [
  { label: t('pricing.monthly'), value: '0' },
  { label: t('pricing.yearly'), value: '1' }
])
</script>

<template>
  <div>
    <UPageHero
      :title="page.title"
      :description="page.description"
    >
      <template #links>
        <UTabs
          v-model="isYearly"
          :items="items"
          color="neutral"
          size="xs"
          class="w-48"
          :ui="{
            list: 'ring ring-accented rounded-full',
            indicator: 'rounded-full',
            trigger: 'w-1/2'
          }"
        />
      </template>
    </UPageHero>

    <UContainer>
      <UPricingPlans scale>
        <UPricingPlan
          v-for="(plan, index) in page.plans"
          :key="index"
          v-bind="plan"
          :price="isYearly === '1' ? plan.price.year : plan.price.month"
          :billing-cycle="isYearly === '1' ? $t('pricing.perYear') : $t('pricing.perMonth')"
        />
      </UPricingPlans>
    </UContainer>
  </div>
</template>
