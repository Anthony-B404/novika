<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Reseller } from '~/types/admin'

defineProps<{
  resellers: Reseller[]
  loading?: boolean
}>()

const emit = defineEmits<{
  view: [reseller: Reseller]
  edit: [reseller: Reseller]
  credits: [reseller: Reseller]
  delete: [reseller: Reseller]
}>()

const { t } = useI18n()

const columns: TableColumn<Reseller>[] = [
  {
    accessorKey: 'name',
    header: t('admin.resellers.table.name')
  },
  {
    accessorKey: 'company',
    header: t('admin.resellers.table.company')
  },
  {
    accessorKey: 'email',
    header: t('admin.resellers.table.email')
  },
  {
    accessorKey: 'creditBalance',
    header: t('admin.resellers.table.credits')
  },
  {
    accessorKey: 'organizationsCount',
    header: t('admin.resellers.table.organizations')
  },
  {
    accessorKey: 'isActive',
    header: t('admin.resellers.table.status')
  },
  {
    accessorKey: 'actions',
    header: ''
  }
]

function getRowActions (reseller: Reseller) {
  return [
    {
      label: t('common.buttons.view'),
      icon: 'i-lucide-eye',
      onSelect: () => emit('view', reseller)
    },
    {
      label: t('common.buttons.edit'),
      icon: 'i-lucide-edit',
      onSelect: () => emit('edit', reseller)
    },
    {
      label: t('admin.resellers.detail.manageCredits'),
      icon: 'i-lucide-coins',
      onSelect: () => emit('credits', reseller)
    },
    {
      type: 'separator' as const
    },
    {
      label: t('admin.resellers.actions.deactivate'),
      icon: 'i-lucide-power-off',
      color: 'error' as const,
      onSelect: () => emit('delete', reseller),
      disabled: !reseller.isActive
    }
  ]
}
</script>

<template>
  <UTable
    :data="resellers"
    :columns="columns"
    :loading="loading"
    @select="(_event: Event, row: { original: Reseller }) => emit('view', row.original)"
  >
    <template #name-cell="{ row }">
      <div>
        <p class="font-medium text-gray-900 dark:text-white">
          {{ row.original.name }}
        </p>
      </div>
    </template>

    <template #creditBalance-cell="{ row }">
      <UBadge color="success" variant="subtle">
        {{ row.original.creditBalance.toLocaleString() }}
      </UBadge>
    </template>

    <template #organizationsCount-cell="{ row }">
      {{ row.original.organizationsCount || 0 }}
    </template>

    <template #isActive-cell="{ row }">
      <UBadge :color="row.original.isActive ? 'success' : 'error'" variant="subtle">
        {{
          row.original.isActive
            ? t('admin.resellers.status.active')
            : t('admin.resellers.status.inactive')
        }}
      </UBadge>
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
