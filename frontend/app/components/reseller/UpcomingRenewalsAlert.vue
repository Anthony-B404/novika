<script setup lang="ts">
import type { UpcomingRenewalsResponse } from '~/types/reseller'

const props = defineProps<{
  data: UpcomingRenewalsResponse | null
}>()

const { t, d } = useI18n()
const localePath = useLocalePath()

const showAlert = computed(() => {
  return props.data && !props.data.summary.hasSufficientCredits && props.data.renewals.length > 0
})

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return d(new Date(dateStr), 'short')
}
</script>

<template>
  <UAlert
    v-if="showAlert"
    color="warning"
    variant="subtle"
    icon="i-lucide-alert-triangle"
    :title="t('reseller.subscription.alerts.insufficientCredits')"
  >
    <template #description>
      <div class="space-y-3">
        <p>
          {{
            t('reseller.subscription.alerts.insufficientCreditsDescription', {
              count: data!.renewals.length,
              needed: data!.summary.totalCreditsNeeded.toLocaleString(),
              available: data!.summary.resellerBalance.toLocaleString(),
              shortfall: data!.summary.shortfall.toLocaleString(),
            })
          }}
        </p>

        <!-- List of affected organizations -->
        <div v-if="data!.renewals.length > 0" class="mt-2">
          <p class="text-sm font-medium mb-2">
            {{ t('reseller.subscription.alerts.affectedOrganizations') }}
          </p>
          <ul class="text-sm space-y-1">
            <li
              v-for="renewal in data!.renewals.slice(0, 5)"
              :key="renewal.id"
              class="flex items-center justify-between"
            >
              <span>{{ renewal.name }}</span>
              <span class="text-gray-500">
                {{ renewal.creditsNeeded.toLocaleString() }}
                {{ t('reseller.subscription.credits') }}
                ({{ formatDate(renewal.nextRenewalAt) }})
              </span>
            </li>
            <li v-if="data!.renewals.length > 5" class="text-gray-500 italic">
              {{ t('reseller.subscription.alerts.andMore', { count: data!.renewals.length - 5 }) }}
            </li>
          </ul>
        </div>

        <UButton
          color="primary"
          variant="outline"
          size="sm"
          icon="i-lucide-plus"
          :to="localePath('/reseller/credits')"
        >
          {{ t('reseller.subscription.alerts.addCredits') }}
        </UButton>
      </div>
    </template>
  </UAlert>
</template>
