<script setup lang="ts">
import type { CreditMode } from '~/types/credit'

interface Props {
  mode: CreditMode
}

const props = defineProps<Props>()
const { t } = useI18n()

const modeLabel = computed(() => {
  return props.mode === 'shared'
    ? t('pages.dashboard.credits.mode.shared')
    : t('pages.dashboard.credits.mode.individual')
})

const modeIcon = computed(() => {
  return props.mode === 'shared' ? 'i-lucide-users' : 'i-lucide-user'
})

const modeColor = computed(() => {
  return props.mode === 'shared' ? 'info' : 'secondary'
})
</script>

<template>
  <UBadge :color="modeColor" variant="subtle" size="lg">
    <UIcon :name="modeIcon" class="mr-1 h-4 w-4" />
    {{ modeLabel }}
  </UBadge>
</template>
