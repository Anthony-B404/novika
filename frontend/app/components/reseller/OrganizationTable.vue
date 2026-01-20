<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { ResellerOrganization } from '~/types/reseller'

defineProps<{
  organizations: ResellerOrganization[]
  loading?: boolean
}>()

const emit = defineEmits<{
  view: [organization: ResellerOrganization]
  credits: [organization: ResellerOrganization]
  users: [organization: ResellerOrganization]
  suspend: [organization: ResellerOrganization]
  restore: [organization: ResellerOrganization]
  delete: [organization: ResellerOrganization]
}>()

const { t } = useI18n()
const { formatDate, formatCredits } = useFormatters()
const { getSectorConfig, getSectorLabel } = useBusinessSectors()

const columns: TableColumn<ResellerOrganization>[] = [
  {
    accessorKey: 'name',
    header: t('reseller.organizations.table.name')
  },
  {
    accessorKey: 'email',
    header: t('reseller.organizations.table.email')
  },
  {
    accessorKey: 'businessSectors',
    header: t('reseller.organizations.table.sectors')
  },
  {
    accessorKey: 'credits',
    header: t('reseller.organizations.table.credits')
  },
  {
    accessorKey: 'subscription',
    header: t('reseller.organizations.table.subscription')
  },
  {
    accessorKey: 'status',
    header: t('reseller.organizations.table.status')
  },
  {
    accessorKey: 'usersCount',
    header: t('reseller.organizations.table.users')
  },
  {
    accessorKey: 'createdAt',
    header: t('reseller.organizations.table.createdAt')
  },
  {
    accessorKey: 'actions',
    header: ''
  }
]

function getRowActions (organization: ResellerOrganization) {
  const actions = []

  // View action is always available
  actions.push({
    label: t('common.buttons.view'),
    icon: 'i-lucide-eye',
    onSelect: () => emit('view', organization)
  })

  // Actions depend on status
  if (organization.status === 'active') {
    // Active: View, Credits, Users, Suspend, Delete
    actions.push({
      label: t('reseller.organizations.actions.distributeCredits'),
      icon: 'i-lucide-coins',
      onSelect: () => emit('credits', organization)
    })
    actions.push({
      label: t('reseller.organizations.actions.manageUsers'),
      icon: 'i-lucide-users',
      onSelect: () => emit('users', organization)
    })
    actions.push({
      label: t('reseller.organizations.actions.suspend'),
      icon: 'i-lucide-pause-circle',
      onSelect: () => emit('suspend', organization)
    })
    actions.push({
      label: t('reseller.organizations.actions.delete'),
      icon: 'i-lucide-trash-2',
      onSelect: () => emit('delete', organization)
    })
  } else if (organization.status === 'suspended') {
    // Suspended: View, Restore, Delete
    actions.push({
      label: t('reseller.organizations.actions.restore'),
      icon: 'i-lucide-rotate-ccw',
      onSelect: () => emit('restore', organization)
    })
    actions.push({
      label: t('reseller.organizations.actions.delete'),
      icon: 'i-lucide-trash-2',
      onSelect: () => emit('delete', organization)
    })
  }
  // Deleted: View only (already added above)

  return actions
}
</script>

<template>
  <UTable
    :data="organizations"
    :columns="columns"
    :loading="loading"
    class="cursor-pointer"
    @select="(_e: Event, row: TableRow<ResellerOrganization>) => emit('view', row.original)"
  >
    <template #name-cell="{ row }">
      <div>
        <p class="font-medium text-gray-900 dark:text-white">
          {{ row.original.name }}
        </p>
      </div>
    </template>

    <template #businessSectors-cell="{ row }">
      <div v-if="row.original.businessSectors?.length > 0" class="flex flex-wrap gap-1">
        <span
          v-for="sector in row.original.businessSectors"
          :key="sector"
          class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
          :class="[
            getSectorConfig(sector).bgClass,
            getSectorConfig(sector).textClass,
          ]"
        >
          <UIcon :name="getSectorConfig(sector).icon" class="h-3 w-3" />
          {{ getSectorLabel(sector) }}
        </span>
      </div>
      <span v-else class="text-gray-400">—</span>
    </template>

    <template #credits-cell="{ row }">
      <UBadge color="success" variant="subtle">
        {{ formatCredits(row.original.credits) }}
      </UBadge>
    </template>

    <template #subscription-cell="{ row }">
      <div class="flex items-center gap-2">
        <UBadge
          v-if="row.original.subscriptionEnabled"
          :color="row.original.subscriptionPausedAt ? 'warning' : 'primary'"
          variant="subtle"
          :icon="row.original.subscriptionPausedAt ? 'i-lucide-pause-circle' : 'i-lucide-repeat'"
        >
          {{
            row.original.subscriptionPausedAt
              ? t('reseller.subscription.status.paused')
              : t('reseller.subscription.status.active')
          }}
        </UBadge>
        <UBadge v-else color="neutral" variant="subtle" icon="i-lucide-credit-card">
          {{ t('reseller.subscription.status.manual') }}
        </UBadge>
      </div>
    </template>

    <template #status-cell="{ row }">
      <ResellerOrganizationStatusBadge
        :status="row.original.status"
        :suspended-at="row.original.suspendedAt"
        :deleted-at="row.original.deletedAt"
      />
    </template>

    <template #usersCount-cell="{ row }">
      {{ row.original.usersCount || 0 }}
    </template>

    <template #createdAt-cell="{ row }">
      {{ formatDate(row.original.createdAt) }}
    </template>

    <template #actions-cell="{ row }">
      <UDropdownMenu :items="getRowActions(row.original)">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-more-horizontal"
          :aria-label="t('common.buttons.actions')"
        />
      </UDropdownMenu>
    </template>
  </UTable>
</template>
