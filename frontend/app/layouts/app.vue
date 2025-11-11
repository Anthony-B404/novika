<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const toast = useToast()

const open = ref(false)

const links = [[{
  label: 'Accueil',
  icon: 'i-lucide-house',
  to: '/dashboard',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Boîte de réception',
  icon: 'i-lucide-inbox',
  to: '/dashboard/inbox',
  badge: '4',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Clients',
  icon: 'i-lucide-users',
  to: '/dashboard/customers',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Paramètres',
  to: '/dashboard/settings',
  icon: 'i-lucide-settings',
  defaultOpen: true,
  type: 'trigger',
  children: [{
    label: 'Général',
    to: '/dashboard/settings',
    exact: true,
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Membres',
    to: '/dashboard/settings/members',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Notifications',
    to: '/dashboard/settings/notifications',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Sécurité',
    to: '/dashboard/settings/security',
    onSelect: () => {
      open.value = false
    }
  }]
}], [{
  label: 'Feedback',
  icon: 'i-lucide-message-circle',
  to: 'https://github.com/nuxt-ui-templates/dashboard',
  target: '_blank'
}, {
  label: 'Aide & Support',
  icon: 'i-lucide-info',
  to: 'https://ui.nuxt.com/docs/getting-started',
  target: '_blank'
}]] satisfies NavigationMenuItem[][]

onMounted(() => {
  toast.add({
    id: 'cookie-consent',
    title: 'Ce site utilise des cookies',
    description: 'Nous utilisons des cookies pour vous garantir la meilleure expérience sur notre site.',
    icon: 'i-lucide-cookie',
    timeout: 0,
    actions: [{
      label: 'Accepter',
      onClick: () => {
        toast.remove('cookie-consent')
      }
    }, {
      label: 'En savoir plus',
      to: 'https://cookiesandyou.com',
      target: '_blank'
    }]
  })
})
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      :ui="{
        header: 'gap-y-3 lg:sticky lg:top-0 lg:z-[1]',
        body: 'gap-y-1',
        footer: 'gap-y-3 lg:sticky lg:bottom-0 lg:z-[1]'
      }"
    >
      <template #header>
        <TeamsMenu />

        <UDashboardSearchButton />
      </template>

      <UNavigationMenu
        v-slot="{ link, active }"
        :items="links"
        :ui="{ wrapper: 'space-y-1' }"
      >
        <UTooltip
          :text="link.label"
          :prevent="!link.collapsed"
          :popper="{ strategy: 'absolute' }"
        >
          <UVerticalNavigationLink
            v-bind="link"
            :active="active"
            :badge="link.badge"
            :ui="{ badge: 'absolute top-1 right-1 ring-1 ring-elevated bg-background text-highlighted' }"
          />
        </UTooltip>
      </UNavigationMenu>

      <template #footer>
        <UNavigationMenu :items="links" />

        <UDivider />

        <UserMenu />
      </template>
    </UDashboardSidebar>

    <slot />

    <NotificationsSlideover />

    <UDashboardSearch
      v-model:open="open"
      :groups="[{
        key: 'customers',
        label: 'Clients',
        icon: 'i-lucide-users'
      }, {
        key: 'pages',
        label: 'Pages',
        icon: 'i-lucide-file'
      }]"
    />
  </UDashboardGroup>
</template>
