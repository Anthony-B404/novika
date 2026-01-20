<script setup lang="ts">
import type { ResellerOrganization } from '~/types/reseller'

const props = defineProps<{
  organization: ResellerOrganization | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const { t } = useI18n()

const confirmationName = ref('')

const isConfirmationValid = computed(() => {
  if (!props.organization) { return false }
  return confirmationName.value.trim().toLowerCase() === props.organization.name.toLowerCase()
})

function handleConfirm () {
  if (isConfirmationValid.value) {
    emit('confirm')
  }
}

function handleCancel () {
  confirmationName.value = ''
  emit('cancel')
}

// Reset form when modal closes
watch(open, (isOpen) => {
  if (!isOpen) {
    confirmationName.value = ''
  }
})
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center gap-2 text-error-500">
        <UIcon name="i-lucide-alert-triangle" class="h-5 w-5" />
        <span>{{ t('reseller.organizations.delete.title', { name: organization?.name }) }}</span>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <UAlert color="error" variant="subtle" :title="t('reseller.organizations.delete.warning')">
          <template #description>
            <div class="mt-2">
              <p class="font-medium">
                {{ t('reseller.organizations.delete.consequences.title') }}
              </p>
              <ul class="mt-1 list-disc list-inside text-sm space-y-1">
                <li>{{ t('reseller.organizations.delete.consequences.access') }}</li>
                <li>{{ t('reseller.organizations.delete.consequences.purge') }}</li>
                <li>{{ t('reseller.organizations.delete.consequences.credits') }}</li>
              </ul>
            </div>
          </template>
        </UAlert>

        <UFormField :label="t('reseller.organizations.delete.confirmLabel')" name="confirmationName">
          <UInput
            v-model="confirmationName"
            :placeholder="t('reseller.organizations.delete.confirmPlaceholder')"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="handleCancel">
          {{ t('common.buttons.cancel') }}
        </UButton>
        <UButton
          color="error"
          :loading="loading"
          :disabled="!isConfirmationValid"
          @click="handleConfirm"
        >
          {{ t('reseller.organizations.delete.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
