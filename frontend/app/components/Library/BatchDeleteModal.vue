<script setup lang="ts">
defineProps<{
  open: boolean
  count: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const { t } = useI18n()

function handleClose () {
  emit('update:open', false)
  emit('cancel')
}

function handleConfirm () {
  emit('confirm')
}
</script>

<template>
  <UModal
    :open="open"
    @update:open="(val) => emit('update:open', val)"
  >
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/30">
              <UIcon name="i-lucide-alert-triangle" class="h-5 w-5 text-error-600 dark:text-error-400" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('pages.dashboard.library.deleteConfirm.title') }}
              </h3>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('pages.dashboard.library.deleteConfirm.message', { count }) }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500">
            {{ t('pages.dashboard.library.deleteConfirm.warning') }}
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              :disabled="loading"
              @click="handleClose"
            >
              {{ t('common.buttons.cancel') }}
            </UButton>
            <UButton
              color="error"
              :loading="loading"
              @click="handleConfirm"
            >
              {{ t('common.buttons.delete') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
