<script setup lang="ts">
import type { Period, Range, Stat } from '~/types/dashboard'

const props = defineProps<{
  period: Period
  range: Range
}>()

function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  })
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const baseStats = [{
  title: 'Clients',
  icon: 'i-lucide-users',
  minValue: 400,
  maxValue: 1000,
  minVariation: -15,
  maxVariation: 25
}, {
  title: 'Conversions',
  icon: 'i-lucide-chart-pie',
  minValue: 1000,
  maxValue: 2000,
  minVariation: -10,
  maxVariation: 20
}, {
  title: 'Revenu',
  icon: 'i-lucide-circle-dollar-sign',
  minValue: 200000,
  maxValue: 500000,
  minVariation: -20,
  maxVariation: 30,
  formatter: formatCurrency
}, {
  title: 'Commandes',
  icon: 'i-lucide-shopping-cart',
  minValue: 100,
  maxValue: 300,
  minVariation: -5,
  maxVariation: 15
}]

const { data: stats } = await useAsyncData<Stat[]>('stats', async () => {
  return baseStats.map((stat) => {
    const value = randomInt(stat.minValue, stat.maxValue)
    const variation = randomInt(stat.minVariation, stat.maxVariation)

    return {
      title: stat.title,
      icon: stat.icon,
      value: stat.formatter ? stat.formatter(value) : value,
      variation
    }
  })
}, {
  watch: [() => props.period, () => props.range]
})
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    <UCard v-for="stat in stats" :key="stat.title" :ui="{ body: 'space-y-3' }">
      <template #body>
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted">
            {{ stat.title }}
          </p>

          <UIcon :name="stat.icon" class="size-5 shrink-0 text-muted" />
        </div>

        <div class="flex items-end justify-between gap-3">
          <p class="text-2xl font-semibold text-highlighted truncate">
            {{ stat.value }}
          </p>

          <UBadge
            :color="stat.variation > 0 ? 'success' : 'error'"
            variant="subtle"
            size="sm"
          >
            {{ stat.variation > 0 ? '+' : '' }}{{ stat.variation }}%
          </UBadge>
        </div>
      </template>
    </UCard>
  </div>
</template>
