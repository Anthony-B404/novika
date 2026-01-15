<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { DistributeCreditsPayload } from '~/types/reseller'

const props = defineProps<{
  loading?: boolean
  maxCredits?: number
}>()

const emit = defineEmits<{
  submit: [data: DistributeCreditsPayload]
}>()

const { t } = useI18n()

// Form state
const state = reactive({
  amount: undefined as number | undefined,
  description: '',
})

// Validation schema
const schema = computed(() =>
  z.object({
    amount: z
      .number({
        required_error: t('reseller.credits.validation.amountRequired'),
        invalid_type_error: t('reseller.credits.validation.amountInvalid'),
      })
      .positive(t('reseller.credits.validation.amountPositive'))
      .max(props.maxCredits || Infinity, t('reseller.credits.validation.amountMax')),
    description: z.string().max(500).optional(),
  })
)

type Schema = z.infer<typeof schema.value>

function onSubmit(event: FormSubmitEvent<Schema>) {
  emit('submit', event.data)
  // Reset form
  state.amount = undefined
  state.description = ''
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField :label="t('reseller.credits.fields.amount')" name="amount" required>
      <UInputNumber
        v-model="state.amount"
        :placeholder="t('reseller.credits.placeholders.amount')"
        :min="1"
        :max="maxCredits"
      />
      <template #hint>
        <span v-if="maxCredits !== undefined" class="text-sm text-gray-500">
          {{ t('reseller.credits.availableCredits', { count: maxCredits?.toLocaleString() }) }}
        </span>
      </template>
    </UFormField>

    <UFormField :label="t('reseller.credits.fields.description')" name="description">
      <UTextarea
        v-model="state.description"
        :placeholder="t('reseller.credits.placeholders.description')"
        :rows="2"
      />
    </UFormField>

    <UButton type="submit" color="primary" block :loading="loading" icon="i-lucide-send">
      {{ t('reseller.credits.distribute') }}
    </UButton>
  </UForm>
</template>
