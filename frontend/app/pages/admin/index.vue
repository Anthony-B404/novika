<script setup lang="ts">
import type { AdminStats } from '~/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const { t, locale } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: t('admin.dashboard.title'),
  description: t('admin.dashboard.subtitle'),
})

const { fetchStats, loading, error } = useResellers()
const stats = ref<AdminStats | null>(null)

onMounted(async () => {
  stats.value = await fetchStats()
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ t('admin.dashboard.title') }}
      </h1>
      <p class="mt-1 text-gray-500 dark:text-gray-400">
        {{ t('admin.dashboard.subtitle') }}
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-500" />
    </div>

    <!-- Error state -->
    <UAlert v-else-if="error" color="error" :title="t('common.error')">
      {{ error }}
    </UAlert>

    <!-- Stats content -->
    <template v-else-if="stats">
      <!-- Stats grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          :title="t('admin.dashboard.stats.totalResellers')"
          :value="stats.resellers.total"
          :subtitle="t('admin.dashboard.stats.activeResellers', { count: stats.resellers.active })"
          icon="i-lucide-building-2"
          color="primary"
        />
        <AdminStatsCard
          :title="t('admin.dashboard.stats.managedOrganizations')"
          :value="stats.organizations.managedByResellers"
          icon="i-lucide-users"
          color="info"
        />
        <AdminStatsCard
          :title="t('admin.dashboard.stats.creditsInPools')"
          :value="stats.credits.totalInPools.toLocaleString()"
          :subtitle="t('admin.dashboard.stats.creditsUnit')"
          icon="i-lucide-coins"
          color="success"
        />
        <AdminStatsCard
          :title="t('admin.dashboard.stats.purchasedThisMonth')"
          :value="stats.credits.purchasedThisMonth.toLocaleString()"
          :subtitle="
            t('admin.dashboard.stats.distributedThisMonth', {
              count: stats.credits.distributedThisMonth,
            })
          "
          icon="i-lucide-trending-up"
          color="warning"
        />
      </div>

      <!-- Two column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Resellers -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">{{ t('admin.dashboard.topResellers') }}</h2>
              <UButton
                :to="localePath('/admin/resellers')"
                color="neutral"
                variant="ghost"
                size="sm"
                trailing-icon="i-lucide-arrow-right"
              >
                {{ t('common.buttons.viewAll') }}
              </UButton>
            </div>
          </template>

          <div
            v-if="stats.topResellers.length > 0"
            class="divide-y divide-gray-100 dark:divide-gray-800"
          >
            <NuxtLink
              v-for="reseller in stats.topResellers"
              :key="reseller.id"
              :to="localePath(`/admin/resellers/${reseller.id}`)"
              class="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-4 px-4 transition-colors"
            >
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ reseller.name }}</p>
                <p class="text-sm text-gray-500">{{ reseller.company }}</p>
              </div>
              <UBadge color="success" variant="subtle">
                {{ reseller.creditBalance.toLocaleString() }} {{ t('common.credits') }}
              </UBadge>
            </NuxtLink>
          </div>
          <div v-else class="py-8 text-center text-gray-500">
            {{ t('admin.dashboard.noResellers') }}
          </div>
        </UCard>

        <!-- Recent Transactions -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">{{ t('admin.dashboard.recentTransactions') }}</h2>
          </template>

          <AdminTransactionHistory
            :transactions="stats.recentTransactions"
            :loading="false"
            show-reseller
          />
        </UCard>
      </div>
    </template>
  </div>
</template>
