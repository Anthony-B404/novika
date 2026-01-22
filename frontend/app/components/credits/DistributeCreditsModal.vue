<script setup lang="ts">
import type { UserCreditBalance } from '~/types/credit'

interface Props {
  open: boolean
  member: UserCreditBalance | null
  organizationCredits: number
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
  amount: 0,
  description: '',
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

// Reset form when modal opens
watch(isOpen, (open) => {
  if (open) {
    form.amount = 0
    form.description = ''
  }
})

const maxAmount = computed(() => props.organizationCredits)

const isValid = computed(() => {
  return form.amount > 0 && form.amount <= maxAmount.value
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
    await creditsStore.distributeCredits({
      userId: props.member.userId,
      amount: form.amount,
      description: form.description || undefined,
    })

    toast.add({
      title: t('common.messages.success'),
      description: t('pages.dashboard.credits.distribute.success', {
        amount: form.amount,
        name: getUserDisplayName(props.member.user),
      }),
      color: 'success',
    })

    emit('success')
    isOpen.value = false
  }
  catch {
    toast.add({
      title: t('common.error'),
      description: t('pages.dashboard.credits.distribute.error'),
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
              {{ t('pages.dashboard.credits.distribute.title') }}
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
              <p class="text-sm text-gray-500">
                {{ t('pages.dashboard.credits.members.balance') }}: {{ member.balance }} {{ t('common.credits') }}
              </p>
            </div>
          </div>

          <!-- Available credits info -->
          <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <p class="text-sm text-gray-500">
              {{ t('pages.dashboard.credits.organization_pool') }}
            </p>
            <p class="text-lg font-semibold">
              {{ organizationCredits }} {{ t('common.credits') }}
            </p>
          </div>

          <!-- Form -->
          <div class="space-y-4">
            <UFormField
              :label="t('pages.dashboard.credits.distribute.amount')"
              name="amount"
            >
              <UInput
                v-model.number="form.amount"
                type="number"
                :min="1"
                :max="maxAmount"
                :placeholder="t('pages.dashboard.credits.distribute.amount_placeholder')"
              />
              <template #hint>
                <span class="text-sm text-gray-500">
                  {{ t('pages.dashboard.credits.distribute.max_available', { max: maxAmount }) }}
                </span>
              </template>
            </UFormField>

            <UFormField
              :label="t('pages.dashboard.credits.distribute.description')"
              name="description"
            >
              <UTextarea
                v-model="form.description"
                :placeholder="t('pages.dashboard.credits.distribute.description_placeholder')"
                :rows="2"
              />
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
              {{ t('pages.dashboard.credits.distribute.submit') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
