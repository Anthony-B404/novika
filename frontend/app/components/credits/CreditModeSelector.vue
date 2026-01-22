<script setup lang="ts">
import type { CreditMode } from '~/types/credit'

interface Props {
  currentMode: CreditMode
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:mode': [mode: CreditMode]
}>()

const { t } = useI18n()
const toast = useToast()
const creditsStore = useCreditsStore()

const selectedMode = ref<CreditMode>(props.currentMode)
const loading = ref(false)
const showConfirmModal = ref(false)
const pendingMode = ref<CreditMode | null>(null)

// Sync with prop changes
watch(
  () => props.currentMode,
  (newMode) => {
    selectedMode.value = newMode
  },
)

const modeOptions = computed(() => [
  {
    value: 'shared' as const,
    label: t('pages.dashboard.credits.mode.shared'),
    description: t('pages.dashboard.credits.mode.shared_description'),
  },
  {
    value: 'individual' as const,
    label: t('pages.dashboard.credits.mode.individual'),
    description: t('pages.dashboard.credits.mode.individual_description'),
  },
])

const hasChanged = computed(() => selectedMode.value !== props.currentMode)

function handleModeChange(newMode: CreditMode) {
  selectedMode.value = newMode
}

async function confirmModeChange() {
  // If switching to shared mode, show confirmation modal
  if (selectedMode.value === 'shared' && props.currentMode === 'individual') {
    pendingMode.value = selectedMode.value
    showConfirmModal.value = true
    return
  }

  await applyModeChange()
}

async function applyModeChange() {
  loading.value = true
  try {
    const response = await creditsStore.updateMode(selectedMode.value)
    if (response) {
      emit('update:mode', response.mode)
      toast.add({
        title: t('common.messages.success'),
        description: t('pages.dashboard.credits.mode_change.success'),
        color: 'success',
      })
    }
  }
  catch {
    toast.add({
      title: t('common.error'),
      description: t('pages.dashboard.credits.mode_change.error'),
      color: 'error',
    })
    // Reset to current mode on error
    selectedMode.value = props.currentMode
  }
  finally {
    loading.value = false
    showConfirmModal.value = false
    pendingMode.value = null
  }
}

function cancelModeChange() {
  showConfirmModal.value = false
  pendingMode.value = null
  selectedMode.value = props.currentMode
}
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-base font-semibold">
        {{ t('pages.dashboard.credits.mode.title') }}
      </h3>
    </template>

    <div class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="option in modeOptions"
          :key="option.value"
          class="cursor-pointer rounded-lg border-2 p-4 transition-colors"
          :class="[
            selectedMode === option.value
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
          ]"
          @click="handleModeChange(option.value)"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
              :class="[
                selectedMode === option.value
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300 dark:border-gray-600',
              ]"
            >
              <div
                v-if="selectedMode === option.value"
                class="h-2 w-2 rounded-full bg-white"
              />
            </div>
            <div>
              <p class="font-medium">{{ option.label }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ option.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <UButton
        :disabled="!hasChanged"
        :loading="loading"
        @click="confirmModeChange"
      >
        {{ t('common.buttons.save') }}
      </UButton>
    </div>

    <!-- Confirmation Modal for switching to shared mode -->
    <UModal v-model:open="showConfirmModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-alert-triangle"
                class="text-amber-500"
              />
              <h3 class="text-base font-semibold">
                {{ t('pages.dashboard.credits.mode_change.confirm_title') }}
              </h3>
            </div>
          </template>

          <p class="text-gray-600 dark:text-gray-300">
            {{ t('pages.dashboard.credits.mode_change.confirm_to_shared') }}
          </p>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="cancelModeChange">
                {{ t('common.buttons.cancel') }}
              </UButton>
              <UButton
                color="primary"
                :loading="loading"
                @click="applyModeChange"
              >
                {{ t('common.buttons.save') }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </UCard>
</template>
