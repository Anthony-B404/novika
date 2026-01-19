<script setup lang="ts">
import type { SubscriptionStatus } from '~/types/reseller'

const props = defineProps<{
  subscription: SubscriptionStatus | null
  showNextRenewal?: boolean
}>()

const { t, d } = useI18n()

const status = computed(() => {
  if (!props.subscription?.subscriptionEnabled) {
    return {
      color: 'neutral' as const,
      label: t('reseller.subscription.status.inactive'),
      icon: 'i-lucide-circle-off',
    }
  }
  if (props.subscription.subscriptionPausedAt) {
    return {
      color: 'warning' as const,
      label: t('reseller.subscription.status.paused'),
      icon: 'i-lucide-pause-circle',
    }
  }
  return {
    color: 'primary' as const,
    label: t('reseller.subscription.status.active'),
    icon: 'i-lucide-repeat',
  }
})

const nextRenewalFormatted = computed(() => {
  if (!props.subscription?.nextRenewalAt) return null
  return d(new Date(props.subscription.nextRenewalAt), 'short')
})
</script>

<template>
  <div class="flex items-center gap-2">
    <UBadge :color="status.color" variant="subtle" size="sm" :icon="status.icon">
      {{ status.label }}
    </UBadge>
    <span
      v-if="showNextRenewal && nextRenewalFormatted && subscription?.isActive"
      class="text-sm text-gray-500"
    >
      {{ t('reseller.subscription.nextRenewal', { date: nextRenewalFormatted }) }}
    </span>
  </div>
</template>
