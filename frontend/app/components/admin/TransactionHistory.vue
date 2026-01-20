<script setup lang="ts">
import type { ResellerTransaction, ResellerTransactionType } from '~/types/admin'

defineProps<{
  transactions: ResellerTransaction[]
  loading?: boolean
  showReseller?: boolean
}>()

const { t, locale } = useI18n()

/**
 * Transaction style configuration - DRY solution for icon, bg color, and icon color
 */
const transactionStyles: Record<
  ResellerTransactionType | 'default',
  { icon: string; bgColor: string; iconColor: string }
> = {
  purchase: {
    icon: 'i-lucide-plus-circle',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-500'
  },
  distribution: {
    icon: 'i-lucide-send',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-500'
  },
  adjustment: {
    icon: 'i-lucide-settings',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-500'
  },
  default: {
    icon: 'i-lucide-circle',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-500'
  }
}

function getTransactionStyle (type: string) {
  return transactionStyles[type as ResellerTransactionType] || transactionStyles.default
}

function formatDate (dateString: string) {
  return new Date(dateString).toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" role="status" aria-live="polite" class="py-8 text-center">
    <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-500" />
    <span class="sr-only">{{ t('common.loading') }}</span>
  </div>

  <!-- Transactions -->
  <div v-else-if="transactions.length > 0" class="divide-y divide-gray-100 dark:divide-gray-800">
    <div
      v-for="tx in transactions"
      :key="tx.id"
      class="flex items-center justify-between py-4"
    >
      <div class="flex items-center gap-4">
        <div
          :class="[
            'flex items-center justify-center w-10 h-10 rounded-xl',
            getTransactionStyle(tx.type).bgColor,
          ]"
        >
          <UIcon
            :name="getTransactionStyle(tx.type).icon"
            :class="['w-5 h-5', getTransactionStyle(tx.type).iconColor]"
            aria-hidden="true"
          />
        </div>
        <div>
          <p class="font-medium text-gray-900 dark:text-white">
            {{ t(`admin.transactions.types.${tx.type}`) }}
          </p>
          <p v-if="showReseller && tx.reseller" class="text-sm text-gray-500">
            {{ tx.reseller.name }}
          </p>
          <p v-else-if="tx.description" class="text-sm text-gray-500">
            {{ tx.description }}
          </p>
          <p v-if="tx.targetOrganization" class="text-xs text-gray-400">
            &rarr; {{ tx.targetOrganization.name }}
          </p>
        </div>
      </div>
      <div class="text-right">
        <p
          :class="['font-bold text-lg', tx.amount > 0 ? 'text-green-600' : 'text-gray-600']"
        >
          {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
        </p>
        <p class="text-xs text-gray-400">
          {{ formatDate(tx.createdAt) }}
        </p>
        <p v-if="tx.performedBy" class="text-xs text-gray-400">
          {{ tx.performedBy.email }}
        </p>
      </div>
    </div>
  </div>

  <!-- Empty -->
  <div v-else class="py-12 text-center">
    <div
      class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
    >
      <UIcon name="i-lucide-receipt" class="h-8 w-8 text-gray-400" />
    </div>
    <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
      {{ t('admin.resellers.credits.noTransactions') }}
    </h3>
    <p class="text-gray-500">
      {{ t('admin.resellers.credits.noTransactionsDescription') }}
    </p>
  </div>
</template>
