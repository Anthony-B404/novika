<script setup lang="ts">
import type { ResellerOrganization } from '~/types/reseller'
import type { TableColumn, TableRow } from '@nuxt/ui'

defineProps<{
  organizations: ResellerOrganization[]
  loading?: boolean
}>()

const emit = defineEmits<{
  view: [organization: ResellerOrganization]
  credits: [organization: ResellerOrganization]
  users: [organization: ResellerOrganization]
}>()

const { t } = useI18n()
const { formatDate, formatCredits } = useFormatters()

const columns: TableColumn<ResellerOrganization>[] = [
  {
    accessorKey: 'name',
    header: t('reseller.organizations.table.name'),
  },
  {
    accessorKey: 'email',
    header: t('reseller.organizations.table.email'),
  },
  {
    accessorKey: 'credits',
    header: t('reseller.organizations.table.credits'),
  },
  {
    accessorKey: 'subscription',
    header: t('reseller.organizations.table.subscription'),
  },
  {
    accessorKey: 'usersCount',
    header: t('reseller.organizations.table.users'),
  },
  {
    accessorKey: 'createdAt',
    header: t('reseller.organizations.table.createdAt'),
  },
  {
    accessorKey: 'actions',
    header: '',
  },
]

function getRowActions(organization: ResellerOrganization) {
  return [
    {
      label: t('common.buttons.view'),
      icon: 'i-lucide-eye',
      onSelect: () => emit('view', organization),
    },
    {
      label: t('reseller.organizations.actions.distributeCredits'),
      icon: 'i-lucide-coins',
      onSelect: () => emit('credits', organization),
    },
    {
      label: t('reseller.organizations.actions.manageUsers'),
      icon: 'i-lucide-users',
      onSelect: () => emit('users', organization),
    },
  ]
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
        <p class="font-medium text-gray-900 dark:text-white">{{ row.original.name }}</p>
      </div>
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
