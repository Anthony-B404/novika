<script setup lang="ts">
import { sub, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Range } from '~/types/dashboard'

const model = defineModel<Range>({ required: true })

const presets = computed(() => [{
  label: '7 derniers jours',
  range: {
    start: sub(new Date(), { days: 7 }),
    end: new Date()
  }
}, {
  label: '14 derniers jours',
  range: {
    start: sub(new Date(), { days: 14 }),
    end: new Date()
  }
}, {
  label: '30 derniers jours',
  range: {
    start: sub(new Date(), { days: 30 }),
    end: new Date()
  }
}, {
  label: '90 derniers jours',
  range: {
    start: sub(new Date(), { days: 90 }),
    end: new Date()
  }
}])

const formattedRange = computed(() => {
  if (!model.value?.start || !model.value?.end) {
    return 'Sélectionner une période'
  }

  return `${format(model.value.start, 'd MMM', { locale: fr })} - ${format(model.value.end, 'd MMM yyyy', { locale: fr })}`
})

function selectPreset(preset: typeof presets.value[0]) {
  model.value = preset.range
}
</script>

<template>
  <UPopover>
    <UButton
      variant="ghost"
      trailing-icon="i-lucide-calendar"
    >
      {{ formattedRange }}
    </UButton>

    <template #content>
      <div class="p-4 space-y-4">
        <div class="flex flex-col gap-2">
          <UButton
            v-for="preset in presets"
            :key="preset.label"
            variant="ghost"
            block
            @click="selectPreset(preset)"
          >
            {{ preset.label }}
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
