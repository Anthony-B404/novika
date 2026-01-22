<script setup lang="ts">
import type { UserCreditBalance } from '~/types/credit'

interface Props {
  open: boolean
  member: UserCreditBalance | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const { t } = useI18n()
const toast = useToast()
const creditsStore = useCreditsStore()

const loading = ref(false)
const form = reactive({
  enabled: false,
  amount: 100,
  day: 1,
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

// Reset form when modal opens or member changes
watch(
  [isOpen, () => props.member],
  ([open, member]) => {
    if (open && member) {
      form.enabled = member.autoRefillEnabled
      form.amount = member.autoRefillAmount ?? 100
      form.day = member.autoRefillDay ?? 1
    }
  },
  { immediate: true },
)

const dayOptions = computed(() => {
  return Array.from({ length: 28 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }))
})

const isValid = computed(() => {
  if (!form.enabled) return true
  return form.amount > 0 && form.day >= 1 && form.day <= 28
})

function getUserDisplayName(user: UserCreditBalance['user'] | undefined): string {
  if (!user) return ''
  if (user.fullName) {
    return user.fullName
  }
  if (user.firstName || user.lastName) {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  }
  return user.email
}

async function onSubmit() {
  if (!props.member || !isValid.value) return

  loading.value = true
  try {
    if (form.enabled) {
      await creditsStore.configureAutoRefill(props.member.userId, {
        enabled: true,
        amount: form.amount,
        day: form.day,
      })
    }
    else {
      await creditsStore.disableAutoRefill(props.member.userId)
    }

    toast.add({
      title: t('common.messages.success'),
      description: t('pages.dashboard.credits.auto_refill.success'),
      color: 'success',
    })

    emit('success')
    isOpen.value = false
  }
  catch {
    toast.add({
      title: t('common.error'),
      description: t('pages.dashboard.credits.auto_refill.error'),
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

function close() {
  isOpen.value = false
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">
              {{ t('pages.dashboard.credits.auto_refill.title') }}
            </h3>
            <UButton
              variant="ghost"
              icon="i-lucide-x"
              size="sm"
              @click="close"
            />
          </div>
        </template>

        <div v-if="member" class="space-y-4">
          <!-- Target user info -->
          <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <UAvatar
              :src="member.user.avatar || undefined"
              :alt="getUserDisplayName(member.user)"
              size="md"
            />
            <div>
              <p class="font-medium">{{ getUserDisplayName(member.user) }}</p>
              <p class="text-sm text-gray-500">{{ member.user.email }}</p>
            </div>
          </div>

          <!-- Enable toggle -->
          <div class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div>
              <p class="font-medium">
                {{ t('pages.dashboard.credits.auto_refill.enabled') }}
              </p>
              <p class="text-sm text-gray-500">
                {{ t('pages.dashboard.credits.auto_refill.enabled_description') }}
              </p>
            </div>
            <USwitch v-model="form.enabled" />
          </div>

          <!-- Configuration (only shown when enabled) -->
          <div v-if="form.enabled" class="space-y-4">
            <UFormField
              :label="t('pages.dashboard.credits.auto_refill.target')"
              name="amount"
            >
              <UInput
                v-model.number="form.amount"
                type="number"
                :min="1"
                :placeholder="t('pages.dashboard.credits.auto_refill.target_placeholder')"
              />
              <template #hint>
                <span class="text-sm text-gray-500">
                  {{ t('pages.dashboard.credits.auto_refill.target_hint') }}
                </span>
              </template>
            </UFormField>

            <UFormField
              :label="t('pages.dashboard.credits.auto_refill.day')"
              name="day"
            >
              <USelect
                v-model="form.day"
                :items="dayOptions"
                value-key="value"
                label-key="label"
                :placeholder="t('pages.dashboard.credits.auto_refill.day_placeholder')"
              />
              <template #hint>
                <span class="text-sm text-gray-500">
                  {{ t('pages.dashboard.credits.auto_refill.day_hint') }}
                </span>
              </template>
            </UFormField>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="close">
              {{ t('common.buttons.cancel') }}
            </UButton>
            <UButton
              color="primary"
              :loading="loading"
              :disabled="!isValid"
              @click="onSubmit"
            >
              {{ t('common.buttons.save') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
