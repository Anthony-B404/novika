<script setup lang="ts">
import type { OrphanOrganization, OrphanDecision } from '~/stores/gdpr'

const props = defineProps<{
  open: boolean;
  organizations: OrphanOrganization[];
  loading: boolean;
}>()

const emit = defineEmits<{
  'update:open': [value: boolean];
  confirm: [decisions: OrphanDecision[]];
}>()

const { t } = useI18n()
const toast = useToast()

// Separate organizations into two groups
const soloOrgs = computed(() =>
  props.organizations.filter(org => getTransferableMembers(org).length === 0)
)

const orgsWithMembers = computed(() =>
  props.organizations.filter(org => getTransferableMembers(org).length > 0)
)

// Track decisions using simple reactive objects (not Map)
const decisions = ref<Record<number, 'transfer' | 'delete'>>({})
const selectedOwners = ref<Record<number, number | undefined>>({})

// Initialize decisions when organizations change
watch(
  () => props.organizations,
  (orgs) => {
    decisions.value = {}
    selectedOwners.value = {}

    orgs.forEach((org) => {
      const otherMembers = getTransferableMembers(org)
      const firstMember = otherMembers[0]
      if (firstMember) {
        // Default to transfer for orgs with members
        decisions.value[org.id] = 'transfer'
        selectedOwners.value[org.id] = firstMember.id
      }
    })
  },
  { immediate: true }
)

// Get non-owner members for an organization
function getTransferableMembers (org: OrphanOrganization) {
  return org.members.filter(m => m.role !== 1)
}

// Get radio items for an organization
function getActionItems (_org: OrphanOrganization) {
  return [
    {
      label: t('pages.dashboard.settings.privacy.orphanOrgs.transferOption'),
      value: 'transfer' as const,
      description: t('pages.dashboard.settings.privacy.orphanOrgs.selectNewOwner')
    },
    {
      label: t('pages.dashboard.settings.privacy.orphanOrgs.deleteOption'),
      value: 'delete' as const,
      description: t('pages.dashboard.settings.privacy.orphanOrgs.deleteAllMembersWarning')
    }
  ]
}

// Get member items for SelectMenu
function getMemberItems (org: OrphanOrganization) {
  return getTransferableMembers(org).map(m => ({
    id: m.id,
    label: m.fullName || m.email,
    email: m.email
  }))
}

// Validate and submit
function handleConfirm () {
  // Validate decisions for orgs with members
  for (const org of orgsWithMembers.value) {
    const decision = decisions.value[org.id]
    if (!decision) {
      toast.add({
        title: t('pages.dashboard.settings.privacy.errors.missingDecisions'),
        color: 'error'
      })
      return
    }

    if (decision === 'transfer' && !selectedOwners.value[org.id]) {
      toast.add({
        title: t('pages.dashboard.settings.privacy.errors.missingDecisions'),
        color: 'error'
      })
      return
    }
  }

  // Build decisions array
  const decisionsArray: OrphanDecision[] = []

  // Add auto-delete decisions for solo orgs
  soloOrgs.value.forEach((org) => {
    decisionsArray.push({
      organizationId: org.id,
      action: 'delete'
    })
  })

  // Add user decisions for orgs with members
  orgsWithMembers.value.forEach((org) => {
    const decision = decisions.value[org.id]
    if (decision) {
      decisionsArray.push({
        organizationId: org.id,
        action: decision,
        newOwnerId: decision === 'transfer' ? selectedOwners.value[org.id] : undefined
      })
    }
  })

  emit('confirm', decisionsArray)
}

function handleClose () {
  emit('update:open', false)
}
</script>

<template>
  <UModal
    :open="open"
    :title="t('pages.dashboard.settings.privacy.orphanOrgs.title')"
    :ui="{ footer: 'justify-end' }"
    class="sm:max-w-2xl"
    @update:open="(val) => emit('update:open', val)"
  >
    <template #body>
      <p class="text-muted mb-6">
        {{ t("pages.dashboard.settings.privacy.orphanOrgs.description") }}
      </p>

      <div class="space-y-8">
        <!-- Section 1: Solo Organizations (auto-delete) -->
        <div v-if="soloOrgs.length > 0">
          <h3 class="mb-2 flex items-center gap-2 font-semibold text-error-600 dark:text-error-400">
            <UIcon name="i-lucide-alert-triangle" class="size-5" />
            {{ t("pages.dashboard.settings.privacy.orphanOrgs.soloOrgsTitle") }}
          </h3>
          <p class="text-muted mb-4 text-sm">
            {{ t("pages.dashboard.settings.privacy.orphanOrgs.soloOrgsDescription") }}
          </p>

          <div class="space-y-2">
            <div
              v-for="org in soloOrgs"
              :key="org.id"
              class="flex items-center justify-between rounded-lg border border-error-200 bg-error-50 p-3 dark:border-error-800 dark:bg-error-900/20"
            >
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-building" class="size-5 text-error-500" />
                <span class="font-medium">{{ org.name }}</span>
              </div>
              <UBadge color="error" variant="subtle">
                {{ t("pages.dashboard.settings.privacy.orphanOrgs.deleteOption") }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Section 2: Organizations with Members (need decision) -->
        <div v-if="orgsWithMembers.length > 0">
          <h3 class="mb-2 flex items-center gap-2 font-semibold">
            <UIcon name="i-lucide-users" class="size-5" />
            {{ t("pages.dashboard.settings.privacy.orphanOrgs.withMembersTitle") }}
          </h3>
          <p class="text-muted mb-4 text-sm">
            {{ t("pages.dashboard.settings.privacy.orphanOrgs.withMembersDescription") }}
          </p>

          <div class="space-y-6">
            <div
              v-for="org in orgsWithMembers"
              :key="org.id"
              class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <!-- Organization Header -->
              <div class="mb-4">
                <h4 class="font-semibold">
                  {{ org.name }}
                </h4>
                <p class="text-muted text-sm">
                  {{ t("pages.dashboard.settings.privacy.orphanOrgs.membersCount", org.membersCount) }}
                </p>
              </div>

              <!-- Action Selection with RadioGroup -->
              <URadioGroup
                v-model="decisions[org.id]"
                :items="getActionItems(org)"
                variant="card"
                :color="decisions[org.id] === 'delete' ? 'error' : 'primary'"
                class="mb-4"
              />

              <!-- New Owner Select (only when transfer is selected) -->
              <div v-if="decisions[org.id] === 'transfer'" class="mt-4">
                <label class="mb-2 block text-sm font-medium">
                  {{ t("pages.dashboard.settings.privacy.orphanOrgs.selectNewOwner") }}
                </label>
                <USelectMenu
                  v-model="selectedOwners[org.id]"
                  :items="getMemberItems(org)"
                  value-key="id"
                  :placeholder="t('pages.dashboard.settings.privacy.orphanOrgs.selectNewOwner')"
                  class="w-full"
                >
                  <template #item-label="{ item }">
                    <div class="flex flex-col">
                      <span>{{ item.label }}</span>
                      <span v-if="item.label !== item.email" class="text-muted text-xs">
                        {{ item.email }}
                      </span>
                    </div>
                  </template>
                </USelectMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton
        :label="t('pages.dashboard.settings.privacy.orphanOrgs.cancelButton')"
        color="neutral"
        variant="outline"
        :disabled="loading"
        @click="handleClose"
      />
      <UButton
        :label="t('pages.dashboard.settings.privacy.orphanOrgs.confirmButton')"
        color="error"
        :loading="loading"
        @click="handleConfirm"
      />
    </template>
  </UModal>
</template>
