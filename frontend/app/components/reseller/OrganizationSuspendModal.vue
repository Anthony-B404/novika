<script setup lang="ts">
import type { ResellerOrganization } from '~/types/reseller'

const props = defineProps<{
  organization: ResellerOrganization | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: [reason?: string]
  cancel: []
}>()

const { t } = useI18n()

const reason = ref('')

function handleConfirm() {
  emit('confirm', reason.value.trim() || undefined)
}

function handleCancel() {
  reason.value = ''
  emit('cancel')
}

// Reset form when modal closes
watch(open, (isOpen) => {
  if (!isOpen) {
    reason.value = ''
  }
})
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center gap-2 text-warning-500">
        <UIcon name="i-lucide-alert-triangle" class="h-5 w-5" />
        <span>{{ t('reseller.organizations.suspend.title', { name: organization?.name }) }}</span>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <UAlert color="warning" variant="subtle" :title="t('reseller.organizations.suspend.warning')">
          <template #description>
            <div class="mt-2">
              <p class="font-medium">{{ t('reseller.organizations.suspend.consequences.title') }}</p>
              <ul class="mt-1 list-disc list-inside text-sm space-y-1">
                <li>{{ t('reseller.organizations.suspend.consequences.users') }}</li>
                <li>{{ t('reseller.organizations.suspend.consequences.credits') }}</li>
                <li>{{ t('reseller.organizations.suspend.consequences.subscription') }}</li>
              </ul>
            </div>
          </template>
        </UAlert>

        <UFormField :label="t('reseller.organizations.suspend.reasonLabel')" name="reason">
          <UTextarea
            v-model="reason"
            :placeholder="t('reseller.organizations.suspend.reasonPlaceholder')"
            :rows="3"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="handleCancel">
          {{ t('common.buttons.cancel') }}
        </UButton>
        <UButton color="warning" :loading="loading" @click="handleConfirm">
          {{ t('reseller.organizations.suspend.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
