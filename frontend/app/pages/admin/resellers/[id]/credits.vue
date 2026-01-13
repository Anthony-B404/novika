<script setup lang="ts">
import type { Reseller, ResellerTransaction, TransactionsFilters, AddCreditsPayload } from '~/types/admin'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const toast = useToast()

const resellerId = computed(() => Number(route.params.id))

useSeoMeta({
  title: t('admin.resellers.credits.title'),
})

const { fetchReseller, fetchTransactions, addCredits, removeCredits, loading } = useResellers()

const reseller = ref<Reseller | null>(null)
const transactions = ref<ResellerTransaction[]>([])
const pagination = ref({ total: 0, perPage: 20, currentPage: 1, lastPage: 1 })
const typeFilter = ref<TransactionsFilters['type']>(undefined)
const addingCredits = ref(false)
const removingCredits = ref(false)

// Load data
onMounted(async () => {
  reseller.value = await fetchReseller(resellerId.value)
  await loadTransactions()
})

// Watch for route param changes (navigation between resellers)
watch(resellerId, async (newId) => {
  if (newId) {
    reseller.value = await fetchReseller(newId)
    await loadTransactions()
  }
})

async function loadTransactions(page = 1) {
  const response = await fetchTransactions(resellerId.value, {
    page,
    limit: pagination.value.perPage,
    type: typeFilter.value,
  })
  if (response) {
    transactions.value = response.transactions.data
    pagination.value = {
      total: response.transactions.meta.total,
      perPage: response.transactions.meta.perPage,
      currentPage: response.transactions.meta.currentPage,
      lastPage: response.transactions.meta.lastPage,
    }
    // Update reseller balance
    if (reseller.value) {
      reseller.value.creditBalance = response.reseller.creditBalance
    }
  }
}

// Watch filter
watch(typeFilter, () => loadTransactions(1))

// Handle page change
function handlePageChange(page: number) {
  loadTransactions(page)
}

// Add credits form
const addCreditsSchema = z.object({
  amount: z.number().positive(t('admin.resellers.credits.validation.amountPositive')).min(1),
  description: z.string().max(500).optional(),
})

type AddCreditsSchema = z.infer<typeof addCreditsSchema>

const addCreditsState = reactive<Partial<AddCreditsSchema>>({
  amount: undefined,
  description: '',
})

async function onAddCredits(event: FormSubmitEvent<AddCreditsSchema>) {
  addingCredits.value = true
  try {
    const payload: AddCreditsPayload = {
      amount: event.data.amount,
    }
    if (event.data.description) {
      payload.description = event.data.description
    }

    const result = await addCredits(resellerId.value, payload)
    if (result) {
      if (reseller.value) {
        reseller.value.creditBalance = result.newBalance
      }
      toast.add({
        title: t('admin.resellers.credits.addSuccess'),
        color: 'success',
      })
      // Reset form
      addCreditsState.amount = undefined
      addCreditsState.description = ''
      // Reload transactions
      await loadTransactions(1)
    }
  } catch (e: unknown) {
    const errorMessage =
      e && typeof e === 'object' && 'data' in e
        ? (e as { data?: { message?: string } }).data?.message
        : undefined
    toast.add({
      title: t('admin.resellers.credits.addError'),
      description: errorMessage,
      color: 'error',
    })
  } finally {
    addingCredits.value = false
  }
}

// Remove credits form
const removeCreditsSchema = z.object({
  amount: z.number().positive(t('admin.resellers.credits.validation.amountPositive')).min(1),
  description: z.string().max(500).optional(),
})

type RemoveCreditsSchema = z.infer<typeof removeCreditsSchema>

const removeCreditsState = reactive<Partial<RemoveCreditsSchema>>({
  amount: undefined,
  description: '',
})

async function onRemoveCredits(event: FormSubmitEvent<RemoveCreditsSchema>) {
  // Validate amount doesn't exceed balance
  if (reseller.value && event.data.amount > reseller.value.creditBalance) {
    toast.add({
      title: t('common.error'),
      description: t('admin.resellers.credits.removeAmountExceedsBalance'),
      color: 'error',
    })
    return
  }

  removingCredits.value = true
  try {
    const payload: AddCreditsPayload = {
      amount: event.data.amount,
    }
    if (event.data.description) {
      payload.description = event.data.description
    }

    const result = await removeCredits(resellerId.value, payload)
    if (result) {
      if (reseller.value) {
        reseller.value.creditBalance = result.newBalance
      }
      toast.add({
        title: t('admin.resellers.credits.removeSuccess'),
        color: 'success',
      })
      // Reset form
      removeCreditsState.amount = undefined
      removeCreditsState.description = ''
      // Reload transactions
      await loadTransactions(1)
    }
  } catch (e: unknown) {
    const errorMessage =
      e && typeof e === 'object' && 'data' in e
        ? (e as { data?: { message?: string } }).data?.message
        : undefined
    toast.add({
      title: t('admin.resellers.credits.removeError'),
      description: errorMessage,
      color: 'error',
    })
  } finally {
    removingCredits.value = false
  }
}

const typeOptions = [
  { label: t('admin.resellers.credits.filters.all'), value: undefined },
  { label: t('admin.transactions.types.purchase'), value: 'purchase' },
  { label: t('admin.transactions.types.distribution'), value: 'distribution' },
  { label: t('admin.transactions.types.adjustment'), value: 'adjustment' },
]
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <UButton
        :to="localePath(`/admin/resellers/${resellerId}`)"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="mb-4"
      >
        {{ t('common.buttons.back') }}
      </UButton>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ t('admin.resellers.credits.title') }}
      </h1>
      <p v-if="reseller" class="mt-1 text-gray-500 dark:text-gray-400">
        {{ reseller.name }} - {{ reseller.company }}
      </p>
    </div>

    <div class="space-y-6">
      <!-- Balance Card -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">
            {{ t('admin.resellers.credits.currentBalance') }}
          </h2>
        </template>

        <div class="text-center py-6">
          <div class="text-5xl font-bold text-primary-500">
            {{ reseller?.creditBalance?.toLocaleString() || 0 }}
          </div>
          <div class="text-gray-500 mt-2">{{ t('common.credits') }}</div>
        </div>
      </UCard>

      <!-- Add and Remove Credits -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Add Credits -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">{{ t('admin.resellers.credits.addCredits') }}</h2>
          </template>

          <UForm
            :schema="addCreditsSchema"
            :state="addCreditsState"
            class="space-y-4"
            @submit="onAddCredits"
          >
            <UFormField :label="t('admin.resellers.credits.amount')" name="amount" required>
              <UInput
                v-model.number="addCreditsState.amount"
                type="number"
                :placeholder="t('admin.resellers.credits.amountPlaceholder')"
                min="1"
              />
            </UFormField>

            <UFormField :label="t('admin.resellers.credits.description')" name="description">
              <UTextarea
                v-model="addCreditsState.description"
                :placeholder="t('admin.resellers.credits.descriptionPlaceholder')"
                :rows="2"
              />
            </UFormField>

            <UButton
              type="submit"
              color="primary"
              block
              :loading="addingCredits"
              icon="i-lucide-plus"
            >
              {{ t('admin.resellers.credits.addButton') }}
            </UButton>
          </UForm>
        </UCard>

        <!-- Remove Credits -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold text-red-600 dark:text-red-400">
              {{ t('admin.resellers.credits.removeCredits') }}
            </h2>
          </template>

          <UForm
            :schema="removeCreditsSchema"
            :state="removeCreditsState"
            class="space-y-4"
            @submit="onRemoveCredits"
          >
            <UFormField :label="t('admin.resellers.credits.amount')" name="amount" required>
              <UInput
                v-model.number="removeCreditsState.amount"
                type="number"
                :placeholder="t('admin.resellers.credits.amountPlaceholder')"
                min="1"
                :max="reseller?.creditBalance || 0"
              />
            </UFormField>

            <UFormField :label="t('admin.resellers.credits.description')" name="description">
              <UTextarea
                v-model="removeCreditsState.description"
                :placeholder="t('admin.resellers.credits.removeDescriptionPlaceholder')"
                :rows="2"
              />
            </UFormField>

            <UButton
              type="submit"
              color="error"
              block
              :loading="removingCredits"
              icon="i-lucide-minus"
              :disabled="!reseller?.creditBalance"
            >
              {{ t('admin.resellers.credits.removeButton') }}
            </UButton>
          </UForm>
        </UCard>
      </div>

      <!-- Transaction History -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ t('admin.resellers.credits.history') }}</h2>
            <USelect
              v-model="typeFilter"
              :items="typeOptions"
              value-key="value"
              :placeholder="t('admin.resellers.credits.filterByType')"
              class="w-40"
            />
          </div>
        </template>

        <AdminTransactionHistory :transactions="transactions" :loading="loading" />

        <!-- Pagination -->
        <div
          v-if="pagination.lastPage > 1"
          class="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <UPagination
            :default-page="pagination.currentPage"
            :total="pagination.total"
            :items-per-page="pagination.perPage"
            @update:page="handlePageChange"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
