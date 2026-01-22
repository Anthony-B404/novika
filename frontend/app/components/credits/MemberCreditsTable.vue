<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { UserCreditBalance } from '~/types/credit'
import { UserRole } from '~/types/auth'

interface Props {
  members: UserCreditBalance[]
}

defineProps<Props>()

const emit = defineEmits<{
  distribute: [member: UserCreditBalance]
  recover: [member: UserCreditBalance]
  'configure-refill': [member: UserCreditBalance]
  'view-history': [member: UserCreditBalance]
}>()

const { t } = useI18n()
const { canRecoverCredits } = useCreditsPermissions()

const columns: TableColumn<UserCreditBalance>[] = [
  {
    accessorKey: 'user',
    header: t('pages.dashboard.credits.members.name'),
  },
  {
    accessorKey: 'role',
    header: t('common.roles.member'),
  },
  {
    accessorKey: 'balance',
    header: t('pages.dashboard.credits.members.balance'),
  },
  {
    accessorKey: 'autoRefill',
    header: t('pages.dashboard.credits.members.auto_refill'),
  },
  {
    accessorKey: 'actions',
    header: t('pages.dashboard.credits.members.actions'),
  },
]

type BadgeColor = 'error' | 'info' | 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'

function getRoleLabel(role: 1 | 2 | 3): string {
  switch (role) {
    case UserRole.Owner:
      return t('common.roles.owner')
    case UserRole.Administrator:
      return t('common.roles.administrator')
    case UserRole.Member:
      return t('common.roles.member')
    default:
      return ''
  }
}

function getRoleColor(role: 1 | 2 | 3): BadgeColor {
  switch (role) {
    case UserRole.Owner:
      return 'primary'
    case UserRole.Administrator:
      return 'info'
    case UserRole.Member:
      return 'neutral'
    default:
      return 'neutral'
  }
}

function getUserDisplayName(user: UserCreditBalance['user']): string {
  if (user.fullName) {
    return user.fullName
  }
  if (user.firstName || user.lastName) {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  }
  return user.email
}

function getActions(member: UserCreditBalance) {
  const actions = []

  // Distribute credits (always available for Owner/Admin)
  actions.push({
    label: t('pages.dashboard.credits.distribute.title'),
    icon: 'i-lucide-plus-circle',
    onSelect: () => emit('distribute', member),
  })

  // Recover credits (Owner only, and only if member has balance)
  if (canRecoverCredits.value && member.balance > 0) {
    actions.push({
      label: t('pages.dashboard.credits.recover.title'),
      icon: 'i-lucide-minus-circle',
      onSelect: () => emit('recover', member),
    })
  }

  // Configure auto-refill
  actions.push({
    label: t('pages.dashboard.credits.auto_refill.title'),
    icon: 'i-lucide-refresh-cw',
    onSelect: () => emit('configure-refill', member),
  })

  // View history
  actions.push({
    label: t('pages.dashboard.credits.history'),
    icon: 'i-lucide-history',
    onSelect: () => emit('view-history', member),
  })

  return actions
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-base font-semibold">
      {{ t('pages.dashboard.credits.members.title') }}
    </h3>

    <UTable :data="members" :columns="columns">
      <template #user-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="row.original.user.avatar || undefined"
            :alt="getUserDisplayName(row.original.user)"
            size="sm"
          />
          <div>
            <p class="font-medium">{{ getUserDisplayName(row.original.user) }}</p>
            <p class="text-sm text-gray-500">{{ row.original.user.email }}</p>
          </div>
        </div>
      </template>

      <template #role-cell="{ row }">
        <UBadge :color="getRoleColor(row.original.role)" variant="subtle">
          {{ getRoleLabel(row.original.role) }}
        </UBadge>
      </template>

      <template #balance-cell="{ row }">
        <CreditsCreditBadge :balance="row.original.balance" :cap="row.original.creditCap" />
      </template>

      <template #autoRefill-cell="{ row }">
        <div v-if="row.original.autoRefillEnabled" class="flex items-center gap-2">
          <UIcon name="i-lucide-check-circle" class="text-green-500" />
          <span class="text-sm">
            {{ row.original.autoRefillAmount }} {{ t('common.credits') }}
            <span class="text-gray-500">
              ({{ t('pages.dashboard.credits.auto_refill.day_label', { day: row.original.autoRefillDay }) }})
            </span>
          </span>
        </div>
        <div v-else class="flex items-center gap-2 text-gray-500">
          <UIcon name="i-lucide-x-circle" />
          <span class="text-sm">{{ t('pages.dashboard.credits.auto_refill.disabled') }}</span>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <UDropdownMenu :items="getActions(row.original)">
          <UButton variant="ghost" icon="i-lucide-more-horizontal" size="sm" />
        </UDropdownMenu>
      </template>
    </UTable>
  </div>
</template>
