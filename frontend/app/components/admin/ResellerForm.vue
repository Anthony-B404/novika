<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { CreateResellerPayload, UpdateResellerPayload } from '~/types/admin'

/**
 * Form initial data structure
 */
interface ResellerFormData {
  name?: string
  email?: string
  phone?: string
  company?: string
  siret?: string
  address?: string
  notes?: string
  isActive?: boolean
}

const props = defineProps<{
  mode: 'create' | 'edit'
  loading?: boolean
  initialData?: ResellerFormData
}>()

const emit = defineEmits<{
  submit: [data: CreateResellerPayload | UpdateResellerPayload]
  cancel: []
}>()

const { t } = useI18n()

// Form state
const state = reactive({
  name: props.initialData?.name || '',
  email: props.initialData?.email || '',
  phone: props.initialData?.phone || '',
  company: props.initialData?.company || '',
  siret: props.initialData?.siret || '',
  address: props.initialData?.address || '',
  notes: props.initialData?.notes || '',
  initialCredits: undefined as number | undefined,
  isActive: props.initialData?.isActive ?? true
})

// Watch for initialData changes (when editing)
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      state.name = data.name || ''
      state.email = data.email || ''
      state.phone = data.phone || ''
      state.company = data.company || ''
      state.siret = data.siret || ''
      state.address = data.address || ''
      state.notes = data.notes || ''
      state.isActive = data.isActive ?? true
    }
  },
  { deep: true }
)

// Validation schema
const schema = z.object({
  name: z.string().min(2, t('admin.resellers.validation.nameMin')),
  email: z.string().email(t('admin.resellers.validation.emailInvalid')),
  phone: z
    .string()
    .min(10, t('admin.resellers.validation.phoneMin'))
    .max(20)
    .optional()
    .or(z.literal('')),
  company: z.string().min(2, t('admin.resellers.validation.companyMin')),
  siret: z
    .string()
    .length(14, t('admin.resellers.validation.siretLength'))
    .regex(/^\d{14}$/, t('admin.resellers.validation.siretFormat'))
    .optional()
    .or(z.literal('')),
  address: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  initialCredits: z.number().positive().optional(),
  isActive: z.boolean().optional()
})

type Schema = z.infer<typeof schema>

function onSubmit (event: FormSubmitEvent<Schema>) {
  emit('submit', event.data)
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField :label="t('admin.resellers.fields.name')" name="name" required>
        <UInput v-model="state.name" :placeholder="t('admin.resellers.placeholders.name')" />
      </UFormField>

      <UFormField :label="t('admin.resellers.fields.email')" name="email" required>
        <UInput
          v-model="state.email"
          type="email"
          :placeholder="t('admin.resellers.placeholders.email')"
        />
      </UFormField>

      <UFormField :label="t('admin.resellers.fields.company')" name="company" required>
        <UInput
          v-model="state.company"
          :placeholder="t('admin.resellers.placeholders.company')"
        />
      </UFormField>

      <UFormField :label="t('admin.resellers.fields.phone')" name="phone">
        <UInput v-model="state.phone" :placeholder="t('admin.resellers.placeholders.phone')" />
      </UFormField>

      <UFormField :label="t('admin.resellers.fields.siret')" name="siret">
        <UInput
          v-model="state.siret"
          :placeholder="t('admin.resellers.placeholders.siret')"
          maxlength="14"
        />
      </UFormField>

      <UFormField
        v-if="mode === 'create'"
        :label="t('admin.resellers.fields.initialCredits')"
        name="initialCredits"
      >
        <UInput
          v-model.number="state.initialCredits"
          type="number"
          :placeholder="t('admin.resellers.placeholders.initialCredits')"
          min="0"
        />
      </UFormField>
    </div>

    <UFormField :label="t('admin.resellers.fields.address')" name="address">
      <UTextarea
        v-model="state.address"
        :placeholder="t('admin.resellers.placeholders.address')"
        :rows="2"
      />
    </UFormField>

    <UFormField :label="t('admin.resellers.fields.notes')" name="notes">
      <UTextarea
        v-model="state.notes"
        :placeholder="t('admin.resellers.placeholders.notes')"
        :rows="3"
      />
    </UFormField>

    <UFormField v-if="mode === 'edit'" name="isActive">
      <UCheckbox v-model="state.isActive" :label="t('admin.resellers.fields.isActive')" />
    </UFormField>

    <div class="flex justify-end gap-2">
      <UButton type="button" color="neutral" variant="outline" @click="emit('cancel')">
        {{ t('common.buttons.cancel') }}
      </UButton>
      <UButton type="submit" color="primary" :loading="loading">
        {{
          mode === 'create'
            ? t('admin.resellers.create.submit')
            : t('admin.resellers.detail.save')
        }}
      </UButton>
    </div>
  </UForm>
</template>
