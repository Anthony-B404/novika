<script setup lang="ts">
import type { Period, Range } from '~/types/dashboard'

const props = defineProps<{
  period: Period
  range: Range
}>()

// Mock chart data - À remplacer par de vraies données
const chartData = computed(() => {
  return {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Ventes',
      data: [12, 19, 3, 5, 2, 3, 9],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2
    }]
  }
})
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">
        Graphique des ventes
      </h3>
    </template>

    <template #body>
      <div class="h-64 flex items-center justify-center text-muted">
        <div class="text-center">
          <UIcon name="i-lucide-bar-chart-3" class="size-12 mx-auto mb-2" />
          <p>Graphique en cours de chargement...</p>
          <p class="text-sm mt-1">Période: {{ period }}</p>
        </div>
      </div>
    </template>
  </UCard>
</template>
