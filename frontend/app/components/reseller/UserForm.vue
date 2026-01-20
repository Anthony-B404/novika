<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { AddUserPayload } from '~/types/reseller'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: AddUserPayload]
  cancel: []
}>()

const { t } = useI18n()

// Form state
const state = reactive({
  email: '',
  firstName: '',
  lastName: '',
  role: 3 as 2 | 3
})

// Role options
const roleOptions = [
  { label: t('reseller.users.roles.administrator'), value: 2 },
  { label: t('reseller.users.roles.member'), value: 3 }
]

// Validation schema
const schema = z.object({
  email: z.string().email(t('reseller.users.validation.emailInvalid')),
  firstName: z.string().min(2, t('reseller.users.validation.firstNameMin')),
  lastName: z.string().min(2, t('reseller.users.validation.lastNameMin')),
  role: z.union([z.literal(2), z.literal(3)], {
    message: t('reseller.users.validation.roleInvalid')
  })
})

type Schema = z.infer<typeof schema>

function onSubmit (event: FormSubmitEvent<Schema>) {
  emit('submit', event.data as AddUserPayload)
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField :label="t('reseller.users.fields.email')" name="email" required>
      <UInput
        v-model="state.email"
        type="email"
        :placeholder="t('reseller.users.placeholders.email')"
      />
    </UFormField>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField :label="t('reseller.users.fields.firstName')" name="firstName" required>
        <UInput v-model="state.firstName" :placeholder="t('reseller.users.placeholders.firstName')" />
      </UFormField>

      <UFormField :label="t('reseller.users.fields.lastName')" name="lastName" required>
        <UInput v-model="state.lastName" :placeholder="t('reseller.users.placeholders.lastName')" />
      </UFormField>
    </div>

    <UFormField :label="t('reseller.users.fields.role')" name="role" required>
      <USelect
        v-model="state.role"
        :items="roleOptions"
        value-key="value"
        :placeholder="t('reseller.users.placeholders.role')"
      />
      <template #hint>
        <p class="text-sm text-gray-500">
          {{ t('reseller.users.form.roleHint') }}
        </p>
      </template>
    </UFormField>

    <div class="flex justify-end gap-2 pt-4">
      <UButton type="button" color="neutral" variant="outline" @click="emit('cancel')">
        {{ t('common.buttons.cancel') }}
      </UButton>
      <UButton type="submit" color="primary" :loading="loading" icon="i-lucide-user-plus">
        {{ t('reseller.users.add.submit') }}
      </UButton>
    </div>
  </UForm>
</template>
