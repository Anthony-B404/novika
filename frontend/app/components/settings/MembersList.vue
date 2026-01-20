<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Member } from '~/types'
import { UserRole } from '~/types/auth'

const { t } = useI18n()
const toast = useToast()
const { getRoleOptions } = useRoles()
const { authenticatedFetch } = useAuth()
const { getAvatarUrl } = useAvatarUrl()

const props = defineProps<{
  members: Member[];
  currentUserRole: UserRole;
}>()

const emit = defineEmits<{
  refresh: [];
}>()

// Modal states
const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const selectedMember = ref<Member | null>(null)

// Loading states for role changes
const roleChanging = ref<number | null>(null)

/**
 * Check if current user can manage (edit/delete) a member
 * - Owner can manage everyone except themselves
 * - Admin can only manage Members (role=3)
 */
const canManageMember = (member: Member): boolean => {
  // Cannot manage yourself
  if (member.isCurrentUser) {
    return false
  }

  // Owner can manage anyone except themselves
  if (props.currentUserRole === UserRole.Owner) {
    return member.role !== UserRole.Owner
  }

  // Admin can only manage Members
  if (props.currentUserRole === UserRole.Administrator) {
    return member.role === UserRole.Member
  }

  return false
}

/**
 * Check if current user can change a member's role
 * Same rules as canManageMember
 */
const canChangeRole = (member: Member): boolean => {
  return canManageMember(member)
}

/**
 * Get dropdown items for a member based on permissions
 */
const getMemberItems = (member: Member): DropdownMenuItem[] => {
  if (!canManageMember(member)) {
    return []
  }

  return [
    {
      label: t('components.settings.members.editMember'),
      onSelect: () => openEditModal(member)
    },
    {
      label: t('components.settings.members.removeMember'),
      color: 'error' as const,
      onSelect: () => openDeleteModal(member)
    }
  ]
}

/**
 * Get role options for a member
 * Owners cannot change roles, so we filter them out
 * Non-editable members show only their current role
 */
const getMemberRoleOptions = (member: Member) => {
  // If member is owner, show only owner option (disabled)
  if (member.role === UserRole.Owner) {
    return getRoleOptions().filter(option => option.value === UserRole.Owner)
  }

  // If current user can't change role, show only current role
  if (!canChangeRole(member)) {
    return getRoleOptions().filter(option => option.value === member.role)
  }

  // Otherwise, show Admin and Member options (never Owner)
  return getRoleOptions().filter(option => option.value !== UserRole.Owner)
}

/**
 * Handle role change - call API
 */
const handleRoleChange = async (member: Member, newRole: UserRole) => {
  if (newRole === member.role) { return }

  roleChanging.value = member.id

  try {
    await authenticatedFetch(`/update-member-role/${member.id}`, {
      method: 'PUT',
      body: { role: newRole }
    })

    toast.add({
      title: t('components.settings.members.roleChangeSuccess'),
      color: 'success'
    })

    emit('refresh')
  } catch (error: any) {
    toast.add({
      title: t('components.settings.members.roleChangeError'),
      description: error.data?.message || '',
      color: 'error'
    })
  } finally {
    roleChanging.value = null
  }
}

/**
 * Open edit modal for a member
 */
const openEditModal = (member: Member) => {
  selectedMember.value = member
  editModalOpen.value = true
}

/**
 * Open delete modal for a member
 */
const openDeleteModal = (member: Member) => {
  selectedMember.value = member
  deleteModalOpen.value = true
}

/**
 * Handle edit modal close
 */
const handleEditClose = () => {
  editModalOpen.value = false
  selectedMember.value = null
}

/**
 * Handle edit modal success
 */
const handleEditUpdated = () => {
  emit('refresh')
}

/**
 * Handle delete modal close
 */
const handleDeleteClose = () => {
  deleteModalOpen.value = false
  selectedMember.value = null
}

/**
 * Handle delete modal success
 */
const handleDeleteDeleted = () => {
  emit('refresh')
}
</script>

<template>
  <ul role="list" class="divide-default divide-y">
    <li
      v-for="member in members"
      :key="member.id"
      class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
    >
      <div class="flex min-w-0 items-center gap-3">
        <UAvatar
          :src="getAvatarUrl(member.avatar)"
          :alt="member.fullName || member.email"
          size="md"
        />

        <div class="min-w-0 text-sm">
          <p class="text-highlighted truncate font-medium">
            {{ member.fullName || member.email }}
          </p>
          <p class="text-muted truncate">
            {{ member.email }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <USelect
          :model-value="member.role"
          :items="getMemberRoleOptions(member)"
          :disabled="
            member.role === UserRole.Owner ||
              !canChangeRole(member) ||
              roleChanging === member.id
          "
          :loading="roleChanging === member.id"
          color="neutral"
          :ui="{ itemLabel: 'label' }"
          @update:model-value="(newRole) => handleRoleChange(member, newRole)"
        />

        <UDropdownMenu
          v-if="canManageMember(member)"
          :items="getMemberItems(member)"
          :content="{ align: 'end' }"
        >
          <UButton
            icon="i-lucide-ellipsis-vertical"
            color="neutral"
            variant="ghost"
          />
        </UDropdownMenu>
      </div>
    </li>
  </ul>

  <!-- Edit Modal -->
  <SettingsMemberEditModal
    :member="selectedMember"
    :open="editModalOpen"
    @close="handleEditClose"
    @updated="handleEditUpdated"
  />

  <!-- Delete Modal -->
  <SettingsMemberDeleteModal
    :member="selectedMember"
    :open="deleteModalOpen"
    @close="handleDeleteClose"
    @deleted="handleDeleteDeleted"
  />
</template>
