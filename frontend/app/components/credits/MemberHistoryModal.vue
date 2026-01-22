<script setup lang="ts">
import type { UserCreditBalance, UserCreditTransaction } from '~/types/credit'

interface Props {
  open: boolean
  member: UserCreditBalance | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t, locale } = useI18n()
const creditsStore = useCreditsStore()

const loading = ref(false)
const transactions = ref<UserCreditTransaction[]>([])

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

// Fetch history when modal opens
watch(
  [isOpen, () => props.member],
  async ([open, member]) => {
    if (open && member) {
      loading.value = true
      try {
        const response = await creditsStore.getMemberHistory(member.userId, 1, 50)
        if (response) {
          transactions.value = response.data
        }
      }
      finally {
        loading.value = false
      }
    }
    else {
      transactions.value = []
    }
  },
  { immediate: true },
)

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

function getTransactionIcon(type: string) {
  switch (type) {
    case 'distribution':
      return 'i-lucide-plus-circle'
    case 'recovery':
      return 'i-lucide-minus-circle'
    case 'usage':
      return 'i-lucide-activity'
    case 'refill':
      return 'i-lucide-refresh-cw'
    default:
      return 'i-lucide-circle'
  }
}

function getTransactionColor(type: string) {
  switch (type) {
    case 'distribution':
    case 'refill':
      return 'text-green-500 dark:text-green-400'
    case 'recovery':
    case 'usage':
      return 'text-slate-500 dark:text-slate-400'
    default:
      return 'text-gray-500'
  }
}

function getTransactionBg(type: string) {
  switch (type) {
    case 'distribution':
    case 'refill':
      return 'bg-green-50 dark:bg-green-900/30'
    case 'recovery':
    case 'usage':
      return 'bg-slate-100 dark:bg-slate-800'
    default:
      return 'bg-gray-100 dark:bg-gray-800'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function close() {
  isOpen.value = false
}
</script>

<template>
  <UModal v-model:open="isOpen" size="lg">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">
              {{ t('pages.dashboard.credits.history') }}
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
          <!-- Member info -->
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

          <!-- Loading -->
          <div v-if="loading" class="py-8 text-center">
            <UIcon
              name="i-lucide-loader-2"
              class="mx-auto h-8 w-8 animate-spin text-primary-500"
            />
          </div>

          <!-- Transactions List -->
          <div
            v-else-if="transactions.length > 0"
            class="max-h-96 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800"
          >
            <div
              v-for="tx in transactions"
              :key="tx.id"
              class="flex items-center justify-between py-3"
            >
              <div class="flex items-center gap-3">
                <div
                  :class="[
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    getTransactionBg(tx.type),
                  ]"
                >
                  <UIcon
                    :name="getTransactionIcon(tx.type)"
                    :class="['h-4 w-4', getTransactionColor(tx.type)]"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ t(`pages.dashboard.credits.transactionTypes.${tx.type}`) }}
                  </p>
                  <p
                    v-if="tx.description"
                    class="max-w-xs truncate text-sm text-gray-500"
                  >
                    {{ tx.description }}
                  </p>
                  <p
                    v-if="tx.performedBy"
                    class="text-xs text-gray-400 dark:text-gray-500"
                  >
                    {{ t('pages.dashboard.credits.performedBy', { name: tx.performedBy.fullName || tx.performedBy.email }) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p
                  :class="[
                    'font-bold',
                    tx.amount > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-slate-700 dark:text-slate-300',
                  ]"
                >
                  {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
                </p>
                <p class="text-xs text-gray-400 tabular-nums">
                  {{ formatDate(tx.createdAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="py-8 text-center">
            <UIcon
              name="i-lucide-receipt"
              class="mx-auto mb-2 h-8 w-8 text-gray-400"
            />
            <p class="text-gray-500">
              {{ t('pages.dashboard.credits.noTransactions') }}
            </p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton variant="ghost" @click="close">
              {{ t('common.buttons.close') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
