<script setup lang="ts">
import type { OrganizationUser } from '~/types/reseller'

const open = defineModel<boolean>('open', { default: false })

defineProps<{
  user: OrganizationUser | null
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
}>()

const { t } = useI18n()
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center gap-2 text-red-500">
        <UIcon name="i-lucide-alert-triangle" class="h-5 w-5" />
        <span class="font-semibold">{{ t('reseller.users.delete.title') }}</span>
      </div>
    </template>

    <template #body>
      <p class="text-gray-900 dark:text-white">
        {{
          t('reseller.users.delete.message', {
            name: user?.fullName || `${user?.firstName} ${user?.lastName}`,
          })
        }}
      </p>
      <p class="mt-2 text-sm text-gray-500">
        {{ t('reseller.users.delete.warning') }}
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="open = false">
          {{ t('common.buttons.cancel') }}
        </UButton>
        <UButton color="error" :loading="loading" :disabled="loading" @click="emit('confirm')">
          {{ t('reseller.users.delete.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
