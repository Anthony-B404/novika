<script setup lang="ts">
import { sub } from 'date-fns'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Period, Range } from '~/types/dashboard'

definePageMeta({
  layout: 'app',
})

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [[{
  label: 'Nouveau message',
  icon: 'i-lucide-send',
  to: '/dashboard/inbox'
}, {
  label: 'Nouveau client',
  icon: 'i-lucide-user-plus',
  to: '/dashboard/customers'
}]] satisfies DropdownMenuItem[][]

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref<Period>('daily')
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Accueil" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <HomeDateRangePicker v-model="range" class="-ml-2.5" />
        </template>

        <template #right>
          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 h-full">
        <HomeStats :period="period" :range="range" />

        <HomeChart :period="period" :range="range" />

        <HomeSales :period="period" :range="range" />
      </div>
    </template>
  </UDashboardPanel>
</template>
