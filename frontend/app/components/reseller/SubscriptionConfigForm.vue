<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { ConfigureSubscriptionPayload, SubscriptionStatus, RenewalType } from '~/types/reseller'

const props = defineProps<{
  loading?: boolean
  subscription?: SubscriptionStatus | null
  currentCredits?: number
}>()

const emit = defineEmits<{
  submit: [data: ConfigureSubscriptionPayload]
  pause: []
  resume: []
}>()

const { t } = useI18n()

// Form state
const state = reactive({
  enabled: props.subscription?.subscriptionEnabled ?? false,
  monthlyCreditsTarget: props.subscription?.monthlyCreditsTarget ?? undefined,
  renewalType: props.subscription?.renewalType ?? ('first_of_month' as RenewalType),
  renewalDay: props.subscription?.renewalDay ?? 1,
})

// Watch for subscription prop changes
watch(
  () => props.subscription,
  (newSubscription) => {
    if (newSubscription) {
      state.enabled = newSubscription.subscriptionEnabled
      state.monthlyCreditsTarget = newSubscription.monthlyCreditsTarget ?? undefined
      state.renewalType = newSubscription.renewalType ?? 'first_of_month'
      state.renewalDay = newSubscription.renewalDay ?? 1
    }
  },
  { immediate: true }
)

// Renewal type options
const renewalTypeOptions = computed(() => [
  {
    value: 'first_of_month',
    label: t('reseller.subscription.renewalType.firstOfMonth'),
  },
  {
    value: 'anniversary',
    label: t('reseller.subscription.renewalType.anniversary'),
  },
])

// Day options for anniversary type (1-28)
const dayOptions = computed(() =>
  Array.from({ length: 28 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }))
)

// Validation schema
const schema = computed(() =>
  z.object({
    enabled: z.boolean(),
    monthlyCreditsTarget: state.enabled
      ? z
          .number({ message: t('reseller.subscription.validation.targetRequired') })
          .positive(t('reseller.subscription.validation.targetPositive'))
      : z.number().optional(),
    renewalType: state.enabled
      ? z.enum(['first_of_month', 'anniversary'], {
          message: t('reseller.subscription.validation.renewalTypeRequired'),
        })
      : z.enum(['first_of_month', 'anniversary']).optional(),
    renewalDay:
      state.enabled && state.renewalType === 'anniversary'
        ? z.number().min(1).max(28)
        : z.number().optional(),
  })
)

type Schema = z.infer<typeof schema.value>

function onSubmit(event: FormSubmitEvent<Schema>) {
  const payload: ConfigureSubscriptionPayload = {
    enabled: event.data.enabled,
    monthlyCreditsTarget: event.data.enabled ? event.data.monthlyCreditsTarget : null,
    renewalType: event.data.enabled ? (event.data.renewalType as RenewalType) : null,
    renewalDay: event.data.enabled && event.data.renewalType === 'anniversary' ? event.data.renewalDay : null,
  }
  emit('submit', payload)
}

const isPaused = computed(() => !!props.subscription?.subscriptionPausedAt)
const canPauseResume = computed(() => props.subscription?.subscriptionEnabled)
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <!-- Enable/Disable subscription -->
    <UFormField :label="t('reseller.subscription.fields.enabled')" name="enabled">
      <USwitch v-model="state.enabled" />
      <template #description>
        {{ t('reseller.subscription.fields.enabledDescription') }}
      </template>
    </UFormField>

    <div v-if="state.enabled" class="space-y-4 pl-4 border-l-2 border-primary-200">
      <!-- Monthly credits target -->
      <UFormField
        :label="t('reseller.subscription.fields.monthlyCreditsTarget')"
        name="monthlyCreditsTarget"
        required
      >
        <UInputNumber
          v-model="state.monthlyCreditsTarget"
          :placeholder="t('reseller.subscription.placeholders.monthlyCreditsTarget')"
          :min="1"
        />
        <template #hint v-if="currentCredits !== undefined">
          <span class="text-sm text-gray-500">
            {{ t('reseller.subscription.currentCredits', { count: currentCredits?.toLocaleString() }) }}
          </span>
        </template>
        <template #description>
          {{ t('reseller.subscription.fields.monthlyCreditsTargetDescription') }}
        </template>
      </UFormField>

      <!-- Renewal type -->
      <UFormField
        :label="t('reseller.subscription.fields.renewalType')"
        name="renewalType"
        required
      >
        <USelect v-model="state.renewalType" :items="renewalTypeOptions" value-key="value" label-key="label" class="w-full" />
        <template #description>
          {{ t('reseller.subscription.fields.renewalTypeDescription') }}
        </template>
      </UFormField>

      <!-- Renewal day (only for anniversary type) -->
      <UFormField
        v-if="state.renewalType === 'anniversary'"
        :label="t('reseller.subscription.fields.renewalDay')"
        name="renewalDay"
        required
      >
        <USelect v-model="state.renewalDay" :items="dayOptions" value-key="value" label-key="label" class="w-full" />
        <template #description>
          {{ t('reseller.subscription.fields.renewalDayDescription') }}
        </template>
      </UFormField>
    </div>

    <div class="flex gap-2">
      <UButton type="submit" color="primary" :loading="loading" icon="i-lucide-save">
        {{ t('common.buttons.save') }}
      </UButton>

      <UButton
        v-if="canPauseResume && !isPaused"
        type="button"
        color="warning"
        variant="outline"
        :loading="loading"
        icon="i-lucide-pause"
        @click="emit('pause')"
      >
        {{ t('reseller.subscription.pause') }}
      </UButton>

      <UButton
        v-if="canPauseResume && isPaused"
        type="button"
        color="primary"
        variant="outline"
        :loading="loading"
        icon="i-lucide-play"
        @click="emit('resume')"
      >
        {{ t('reseller.subscription.resume') }}
      </UButton>
    </div>
  </UForm>
</template>
