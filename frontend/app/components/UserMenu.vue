<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const appConfig = useAppConfig()

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']

const user = ref({
  name: 'Utilisateur',
  avatar: {
    src: 'https://github.com/nuxt.png',
    alt: 'Utilisateur'
  }
})

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: user.value.name,
  avatar: user.value.avatar
}], [{
  label: 'Profil',
  icon: 'i-lucide-user'
}, {
  label: 'Facturation',
  icon: 'i-lucide-credit-card'
}, {
  label: 'Paramètres',
  icon: 'i-lucide-settings',
  to: '/dashboard/settings'
}], [{
  label: 'Thème',
  icon: 'i-lucide-palette',
  children: [{
    label: 'Couleur primaire',
    slot: 'chip',
    chip: appConfig.ui.colors.primary,
    content: {
      align: 'center',
      collisionPadding: 16
    },
    children: colors.map(color => ({
      label: color,
      chip: color,
      slot: 'chip',
      checked: appConfig.ui.colors.primary === color,
      type: 'checkbox',
      onSelect: (e) => {
        e.preventDefault()
        appConfig.ui.colors.primary = color
      }
    }))
  }, {
    label: 'Couleur neutre',
    slot: 'chip',
    chip: appConfig.ui.colors.neutral,
    content: {
      align: 'center',
      collisionPadding: 16
    },
    children: neutrals.map(color => ({
      label: color,
      chip: color,
      slot: 'chip',
      checked: appConfig.ui.colors.neutral === color,
      type: 'checkbox',
      onSelect: (e) => {
        e.preventDefault()
        appConfig.ui.colors.neutral = color
      }
    }))
  }, {
    type: 'separator'
  }, {
    label: 'Clair',
    icon: 'i-lucide-sun',
    checked: colorMode.value === 'light',
    type: 'checkbox',
    onSelect: () => {
      colorMode.preference = 'light'
    }
  }, {
    label: 'Sombre',
    icon: 'i-lucide-moon',
    checked: colorMode.value === 'dark',
    type: 'checkbox',
    onSelect: () => {
      colorMode.preference = 'dark'
    }
  }, {
    label: 'Système',
    icon: 'i-lucide-laptop',
    checked: colorMode.value === 'system',
    type: 'checkbox',
    onSelect: () => {
      colorMode.preference = 'system'
    }
  }]
}], [{
  label: 'Se déconnecter',
  icon: 'i-lucide-log-out'
}]]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'start', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user.name,
        avatar: collapsed ? { ...user.avatar, size: 'md' } : user.avatar
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
    />
  </UDropdownMenu>
</template>
