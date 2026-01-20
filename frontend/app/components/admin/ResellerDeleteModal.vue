<script setup lang="ts">
import type { Reseller } from '~/types/admin'

defineProps<{
  reseller: Reseller | null
}>()

const open = defineModel<boolean>('open', { default: false })

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
        <span>{{ t('admin.resellers.delete.title') }}</span>
      </div>
    </template>

    <template #body>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('admin.resellers.delete.message', { name: reseller?.name }) }}
      </p>
      <p class="mt-2 text-sm text-gray-500">
        {{ t('admin.resellers.delete.warning') }}
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="open = false">
          {{ t('common.buttons.cancel') }}
        </UButton>
        <UButton color="error" @click="emit('confirm')">
          {{ t('admin.resellers.delete.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
