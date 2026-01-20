<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useI18n()
const { authenticatedFetch } = useAuth()

const open = defineModel<boolean>('open', { default: false })
const loading = ref(false)

const schema = z.object({
  subject: z
    .string()
    .min(5, t('components.contactSupport.validation.subjectTooShort'))
    .max(200, t('components.contactSupport.validation.subjectTooLong')),
  message: z
    .string()
    .min(20, t('components.contactSupport.validation.messageTooShort'))
    .max(5000, t('components.contactSupport.validation.messageTooLong'))
})

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  subject: undefined,
  message: undefined
})

const toast = useToast()

function resetForm () {
  state.subject = undefined
  state.message = undefined
}

async function onSubmit (event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await authenticatedFetch('/contact', {
      method: 'POST',
      body: {
        subject: event.data.subject,
        message: event.data.message
      }
    })

    toast.add({
      title: t('components.contactSupport.successTitle'),
      description: t('components.contactSupport.successDescription'),
      color: 'success'
    })

    resetForm()
    open.value = false
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: t('components.contactSupport.errorTitle'),
      description:
        err.data?.message || t('components.contactSupport.errorDescription'),
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('components.contactSupport.title')"
    :description="t('components.contactSupport.description')"
  >
    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField
          :label="t('components.contactSupport.subject')"
          name="subject"
        >
          <UInput
            v-model="state.subject"
            :placeholder="t('components.contactSupport.subjectPlaceholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField
          :label="t('components.contactSupport.message')"
          name="message"
        >
          <UTextarea
            v-model="state.message"
            :placeholder="t('components.contactSupport.messagePlaceholder')"
            :rows="5"
            class="w-full"
          />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            :label="t('common.buttons.cancel')"
            color="neutral"
            variant="subtle"
            :disabled="loading"
            @click="open = false"
          />
          <UButton
            :label="t('components.contactSupport.send')"
            color="primary"
            variant="solid"
            type="submit"
            :loading="loading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
