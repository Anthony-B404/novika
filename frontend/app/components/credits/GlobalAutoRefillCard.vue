<script setup lang="ts">
const emit = defineEmits<{
  success: []
}>()

const { t } = useI18n()
const toast = useToast()
const creditsStore = useCreditsStore()

const {
  globalAutoRefillEnabled,
  globalAutoRefillDefaultAmount,
  globalAutoRefillDefaultDay,
} = storeToRefs(creditsStore)

const loading = ref(false)
const initialLoading = ref(true)
const form = reactive({
  enabled: false,
  defaultAmount: 100,
  defaultDay: 1,
})

// Load global auto-refill settings on mount
onMounted(async () => {
  try {
    await creditsStore.fetchGlobalAutoRefill()
    form.enabled = globalAutoRefillEnabled.value
    form.defaultAmount = globalAutoRefillDefaultAmount.value ?? 100
    form.defaultDay = globalAutoRefillDefaultDay.value ?? 1
  }
  finally {
    initialLoading.value = false
  }
})

// Day options (1-28)
const dayOptions = computed(() => {
  return Array.from({ length: 28 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }))
})

const isValid = computed(() => {
  if (!form.enabled) return true
  return form.defaultAmount > 0 && form.defaultDay >= 1 && form.defaultDay <= 28
})

const hasChanged = computed(() => {
  return (
    form.enabled !== globalAutoRefillEnabled.value
    || form.defaultAmount !== (globalAutoRefillDefaultAmount.value ?? 100)
    || form.defaultDay !== (globalAutoRefillDefaultDay.value ?? 1)
  )
})

async function onSubmit() {
  if (!isValid.value) return

  loading.value = true
  try {
    if (form.enabled) {
      await creditsStore.configureGlobalAutoRefill({
        enabled: true,
        defaultAmount: form.defaultAmount,
        defaultDay: form.defaultDay,
      })
    }
    else {
      await creditsStore.disableGlobalAutoRefill()
    }

    toast.add({
      title: t('common.messages.success'),
      description: t('pages.dashboard.credits.global_auto_refill.success'),
      color: 'success',
    })

    emit('success')
  }
  catch {
    toast.add({
      title: t('common.error'),
      description: t('pages.dashboard.credits.global_auto_refill.error'),
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-refresh-cw" class="h-5 w-5 text-primary-500" />
        <h3 class="text-base font-semibold">
          {{ t('pages.dashboard.credits.global_auto_refill.title') }}
        </h3>
      </div>
    </template>

    <!-- Loading state -->
    <div v-if="initialLoading" class="py-4 text-center">
      <UIcon
        name="i-lucide-loader-2"
        class="mx-auto h-6 w-6 animate-spin text-primary-500"
      />
    </div>

    <div v-else class="space-y-4">
      <!-- Description -->
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ t('pages.dashboard.credits.global_auto_refill.description') }}
      </p>

      <!-- Enable toggle -->
      <div class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div>
          <p class="font-medium">
            {{ t('pages.dashboard.credits.global_auto_refill.enabled') }}
          </p>
          <p class="text-sm text-gray-500">
            {{ t('pages.dashboard.credits.global_auto_refill.enabled_description') }}
          </p>
        </div>
        <USwitch v-model="form.enabled" />
      </div>

      <!-- Configuration (only shown when enabled) -->
      <div v-if="form.enabled" class="space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
        <UFormField
          :label="t('pages.dashboard.credits.global_auto_refill.target')"
          name="defaultAmount"
        >
          <UInput
            v-model.number="form.defaultAmount"
            type="number"
            :min="1"
            :placeholder="t('pages.dashboard.credits.global_auto_refill.target_placeholder')"
          />
          <template #hint>
            <span class="text-sm text-gray-500">
              {{ t('pages.dashboard.credits.global_auto_refill.target_hint') }}
            </span>
          </template>
        </UFormField>

        <UFormField
          :label="t('pages.dashboard.credits.global_auto_refill.day')"
          name="defaultDay"
        >
          <USelect
            v-model="form.defaultDay"
            :items="dayOptions"
            value-key="value"
            label-key="label"
            :placeholder="t('pages.dashboard.credits.global_auto_refill.day_placeholder')"
          />
          <template #hint>
            <span class="text-sm text-gray-500">
              {{ t('pages.dashboard.credits.global_auto_refill.day_hint') }}
            </span>
          </template>
        </UFormField>
      </div>

      <UButton
        :disabled="!hasChanged || !isValid"
        :loading="loading"
        @click="onSubmit"
      >
        {{ t('common.buttons.save') }}
      </UButton>
    </div>
  </UCard>
</template>
