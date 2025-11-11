<script setup lang="ts">
import { eachDayOfInterval } from 'date-fns'
import type { Period, Range } from '~/types/dashboard'

const model = defineModel<Period>({ required: true })

const props = defineProps<{
  range: Range
}>()

const days = computed(() => eachDayOfInterval(props.range))

const periods = computed<Period[]>(() => {
  if (days.value.length <= 8) {
    return [
      'daily'
    ]
  }

  if (days.value.length <= 31) {
    return [
      'daily',
      'weekly'
    ]
  }

  return [
    'weekly',
    'monthly'
  ]
})

// Ensure the model value is always a valid period
watch(periods, () => {
  if (!periods.value.includes(model.value)) {
    model.value = periods.value[0]!
  }
})

const periodLabels: Record<Period, string> = {
  'daily': 'Quotidien',
  'weekly': 'Hebdomadaire',
  'monthly': 'Mensuel',
  'quarterly': 'Trimestriel',
  'yearly': 'Annuel'
}

const periodsWithLabels = computed(() =>
  periods.value.map(period => ({
    value: period,
    label: periodLabels[period]
  }))
)
</script>

<template>
  <USelect
    v-model="model"
    :items="periodsWithLabels"
    value-key="value"
    label-key="label"
    variant="ghost"
    class="data-[state=open]:bg-elevated"
    :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
  />
</template>
