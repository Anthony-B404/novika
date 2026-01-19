<script setup lang="ts">
import type { ResellerOrganization } from '~/types/reseller'

defineProps<{
  organization: ResellerOrganization | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const { t } = useI18n()
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center gap-2 text-primary-500">
        <UIcon name="i-lucide-rotate-ccw" class="h-5 w-5" />
        <span>{{ t('reseller.organizations.restore.title', { name: organization?.name }) }}</span>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('reseller.organizations.restore.message') }}
        </p>

        <UAlert color="info" variant="subtle" icon="i-lucide-info">
          <template #description>
            {{ t('reseller.organizations.restore.note') }}
          </template>
        </UAlert>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="emit('cancel')">
          {{ t('common.buttons.cancel') }}
        </UButton>
        <UButton color="primary" :loading="loading" @click="emit('confirm')">
          {{ t('reseller.organizations.restore.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
