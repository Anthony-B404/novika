<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ApiError } from '~/types'
import { storeToRefs } from 'pinia'
import { useOrganizationStore } from '~/stores/organization'

const { t } = useI18n()
const config = useRuntimeConfig()
const toast = useToast()
const { authenticatedFetch } = useAuth()

defineProps<{
  collapsed?: boolean;
}>()

// Récupérer l'organisation depuis le store
const organizationStore = useOrganizationStore()
const { organization, organizations, loading } = storeToRefs(organizationStore)

// Charger toutes les organisations au montage
onMounted(() => {
  if (organizations.value.length === 0) {
    organizationStore.fetchUserOrganizations()
  }
})

// Calculer l'URL du logo
const logoUrl = computed(() => {
  if (!organization.value?.logo) {
    return null
  }
  return `${config.public.apiUrl}/${organization.value.logo}`
})

// Créer l'objet team à partir de l'organisation
const currentTeam = computed(() => {
  if (!organization.value) {
    return {
      label: t('components.teams.loading'),
      avatar: undefined
    }
  }

  return {
    label: organization.value.name,
    avatar: logoUrl.value
      ? {
          src: logoUrl.value,
          alt: organization.value.name
        }
      : undefined
  }
})

// Switcher vers une autre organisation
async function switchOrganization (orgId: number) {
  try {
    // Appeler l'API pour changer d'organisation
    await authenticatedFetch(`/organizations/${orgId}/switch`, {
      method: 'POST'
    })

    // Recharger toutes les organisations (mise à jour du isCurrent)
    await organizationStore.fetchUserOrganizations()

    // Afficher un toast de succès
    toast.add({
      title: t('common.messages.success'),
      description: t('components.teams.organizationSwitched'),
      color: 'success'
    })
  } catch (error: unknown) {
    const apiError = error as ApiError
    toast.add({
      title: t('common.messages.error'),
      description:
        apiError.data?.message || t('components.teams.organizationSwitchError'),
      color: 'error'
    })
  }
}

const items = computed<DropdownMenuItem[][]>(() => {
  // Construire la liste des organisations
  const organizationItems = organizations.value.map((org) => {
    return {
      id: `org-${org.id}`,
      label: org.name,
      avatar: org.logo
        ? {
            src: `${config.public.apiUrl}/${org.logo}`,
            alt: org.name
          }
        : undefined,
      // Show check icon if current
      trailingIcon: org.isCurrent ? 'i-lucide-check' : undefined,
      class: org.isCurrent ? 'bg-primary/10' : undefined,
      onClick: () => {
        if (!org.isCurrent) {
          switchOrganization(org.id)
        }
      }
    }
  })

  return [organizationItems]
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)',
    }"
  >
    <UButton
      v-bind="{
        ...currentTeam,
        label: collapsed ? undefined : currentTeam?.label,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      :disabled="loading"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />
  </UDropdownMenu>
</template>
