<script setup lang="ts">
import type { OrganizationUser } from '~/types/reseller'
import { USER_ROLES } from '~/types/reseller'
import type { TableColumn } from '@nuxt/ui'

defineProps<{
  users: OrganizationUser[]
  loading?: boolean
}>()

const emit = defineEmits<{
  delete: [user: OrganizationUser]
}>()

const { t } = useI18n()
const { formatDate } = useFormatters()

const columns: TableColumn<OrganizationUser>[] = [
  {
    accessorKey: 'fullName',
    header: t('reseller.users.table.name'),
  },
  {
    accessorKey: 'email',
    header: t('reseller.users.table.email'),
  },
  {
    accessorKey: 'role',
    header: t('reseller.users.table.role'),
  },
  {
    accessorKey: 'createdAt',
    header: t('reseller.users.table.createdAt'),
  },
  {
    accessorKey: 'actions',
    header: '',
  },
]

// Role configuration - single source of truth for labels and colors
const roleConfig: Record<number, { label: string; color: string }> = {
  [USER_ROLES.OWNER]: {
    label: t('reseller.users.roles.owner'),
    color: 'primary',
  },
  [USER_ROLES.ADMINISTRATOR]: {
    label: t('reseller.users.roles.administrator'),
    color: 'info',
  },
  [USER_ROLES.MEMBER]: {
    label: t('reseller.users.roles.member'),
    color: 'neutral',
  },
}

function getRoleLabel(role: number) {
  return roleConfig[role]?.label || '-'
}

function getRoleColor(role: number) {
  return roleConfig[role]?.color || 'neutral'
}

function getRowActions(user: OrganizationUser) {
  // Cannot delete owner
  if (user.role === USER_ROLES.OWNER) {
    return [
      {
        label: t('reseller.users.actions.cannotDeleteOwner'),
        icon: 'i-lucide-info',
        disabled: true,
      },
    ]
  }

  return [
    {
      label: t('common.buttons.delete'),
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => emit('delete', user),
    },
  ]
}
</script>

<template>
  <UTable :data="users" :columns="columns" :loading="loading">
    <template #fullName-cell="{ row }">
      <div>
        <p class="font-medium text-gray-900 dark:text-white">
          {{ row.original.fullName || `${row.original.firstName} ${row.original.lastName}` }}
        </p>
        <p
          v-if="!row.original.onboardingCompleted"
          class="text-xs text-orange-500"
        >
          {{ t('reseller.users.pendingInvitation') }}
        </p>
      </div>
    </template>

    <template #role-cell="{ row }">
      <UBadge :color="getRoleColor(row.original.role)" variant="subtle">
        {{ getRoleLabel(row.original.role) }}
      </UBadge>
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
          :disabled="row.original.role === USER_ROLES.OWNER"
        />
      </UDropdownMenu>
    </template>
  </UTable>
</template>
