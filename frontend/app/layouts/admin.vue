<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { user, logout } = useAuth()

// Sidebar collapsed state (persisted in localStorage)
const collapsed = useCookie<boolean>('admin-sidebar-collapsed', {
  default: () => false,
})

// Navigation items for the sidebar
const navigationItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: t('admin.navigation.dashboard'),
      icon: 'i-lucide-layout-dashboard',
      to: localePath('/admin'),
      active: route.path === localePath('/admin'),
    },
    {
      label: t('admin.navigation.resellers'),
      icon: 'i-lucide-building-2',
      to: localePath('/admin/resellers'),
      active: route.path.startsWith(localePath('/admin/resellers')),
    },
  ],
  [
    {
      label: t('admin.navigation.backToApp'),
      icon: 'i-lucide-arrow-left',
      to: localePath('/dashboard'),
    },
  ],
])

// User menu items for the footer dropdown
const userMenuItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: user.value?.email || '',
      slot: 'account',
      disabled: true,
    },
  ],
  [
    {
      label: t('common.buttons.logout'),
      icon: 'i-lucide-log-out',
      click: handleLogout,
    },
  ],
])

async function handleLogout() {
  await logout()
  navigateTo(localePath('/'))
}
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      v-model:collapsed="collapsed"
      collapsible
      resizable
      :ui="{ footer: 'border-t border-default' }"
    >
      <template #header="{ collapsed: isCollapsed }">
        <div class="flex items-center gap-2 px-2 py-3">
          <div
            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500"
          >
            <UIcon name="i-lucide-shield-check" class="h-5 w-5 text-white" />
          </div>
          <span v-if="!isCollapsed" class="font-semibold text-gray-900 dark:text-white">
            {{ t('admin.title') }}
          </span>
        </div>
      </template>

      <template #default="{ collapsed: isCollapsed }">
        <UNavigationMenu
          :collapsed="isCollapsed"
          :items="navigationItems[0]"
          orientation="vertical"
        />

        <UNavigationMenu
          :collapsed="isCollapsed"
          :items="navigationItems[1]"
          orientation="vertical"
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed: isCollapsed }">
        <UDropdownMenu :items="userMenuItems">
          <UButton
            color="neutral"
            variant="ghost"
            class="w-full justify-start"
            :class="{ 'justify-center': isCollapsed }"
          >
            <UAvatar
              :src="user?.avatar || undefined"
              :alt="user?.fullName || user?.email || undefined"
              size="2xs"
            />
            <span v-if="!isCollapsed" class="truncate">
              {{ user?.fullName || user?.email }}
            </span>
          </UButton>
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <div class="max-w-7xl mx-auto w-full">
        <slot />
      </div>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
