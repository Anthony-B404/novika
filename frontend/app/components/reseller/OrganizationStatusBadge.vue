<script setup lang="ts">
import type { OrganizationStatus } from '~/types/reseller'

const props = defineProps<{
  status: OrganizationStatus
  suspendedAt?: string | null
  deletedAt?: string | null
}>()

const { t } = useI18n()
const { formatDate } = useFormatters()

type BadgeColor = 'success' | 'warning' | 'error'

const statusConfig: Record<OrganizationStatus, { color: BadgeColor; icon: string; labelKey: string }> = {
  active: {
    color: 'success',
    icon: 'i-lucide-check-circle',
    labelKey: 'reseller.organizations.status.active'
  },
  suspended: {
    color: 'warning',
    icon: 'i-lucide-pause-circle',
    labelKey: 'reseller.organizations.status.suspended'
  },
  deleted: {
    color: 'error',
    icon: 'i-lucide-trash-2',
    labelKey: 'reseller.organizations.status.deleted'
  }
}

const config = computed(() => statusConfig[props.status])

const tooltipText = computed(() => {
  if (props.status === 'suspended' && props.suspendedAt) {
    return `${t('reseller.organizations.status.suspendedAt')} ${formatDate(props.suspendedAt)}`
  }
  if (props.status === 'deleted' && props.deletedAt) {
    return `${t('reseller.organizations.status.deletedAt')} ${formatDate(props.deletedAt)}`
  }
  return undefined
})
</script>

<template>
  <UTooltip v-if="tooltipText" :text="tooltipText">
    <UBadge :color="config.color" variant="subtle" :icon="config.icon">
      {{ t(config.labelKey) }}
    </UBadge>
  </UTooltip>
  <UBadge v-else :color="config.color" variant="subtle" :icon="config.icon">
    {{ t(config.labelKey) }}
  </UBadge>
</template>
