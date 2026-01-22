<script setup lang="ts">
interface Props {
  balance: number
  cap?: number | null
}

const props = defineProps<Props>()
const { t } = useI18n()

// Calculate status based on balance and cap
const status = computed(() => {
  if (props.balance === 0) {
    return 'empty'
  }
  if (props.cap && props.balance < props.cap * 0.2) {
    return 'low'
  }
  return 'normal'
})

const balanceClass = computed(() => {
  switch (status.value) {
    case 'empty':
      return 'text-red-600 dark:text-red-400 font-semibold'
    case 'low':
      return 'text-amber-600 dark:text-amber-400 font-semibold'
    default:
      return 'text-gray-900 dark:text-gray-100'
  }
})

const statusColor = computed(() => {
  switch (status.value) {
    case 'empty':
      return 'error'
    case 'low':
      return 'warning'
    default:
      return 'neutral'
  }
})

const statusLabel = computed(() => {
  switch (status.value) {
    case 'empty':
      return t('pages.dashboard.credits.status.empty')
    case 'low':
      return t('pages.dashboard.credits.status.low')
    default:
      return ''
  }
})
</script>

<template>
  <div class="flex items-center gap-2">
    <span :class="balanceClass">{{ balance }}</span>
    <span v-if="cap" class="text-gray-400 dark:text-gray-500">/ {{ cap }}</span>
    <UBadge v-if="status !== 'normal'" :color="statusColor" size="xs">
      {{ statusLabel }}
    </UBadge>
  </div>
</template>
