<script setup lang="ts">
import type { Reseller, ResellersFilters } from '~/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

useSeoMeta({
  title: t('admin.resellers.list.title')
})

const { fetchResellers, deactivateReseller, loading, error } = useResellers()

// State
const resellers = ref<Reseller[]>([])
const pagination = ref({
  total: 0,
  perPage: 20,
  currentPage: 1,
  lastPage: 1
})

// Filters
const search = ref('')
const activeFilter = ref<boolean | undefined>(undefined)

// Delete modal
const deleteModalOpen = ref(false)
const resellerToDelete = ref<Reseller | null>(null)

// Load resellers
async function loadResellers (page = 1) {
  const filters: ResellersFilters = {
    page,
    limit: pagination.value.perPage,
    search: search.value || undefined,
    isActive: activeFilter.value,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }

  const response = await fetchResellers(filters)
  if (response) {
    resellers.value = response.data
    pagination.value = {
      total: response.meta.total,
      perPage: response.meta.perPage,
      currentPage: response.meta.currentPage,
      lastPage: response.meta.lastPage
    }
  }
}

// Initial load
onMounted(() => loadResellers())

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  loadResellers(1)
}, 300)

// Watch filters
watch(search, () => {
  debouncedSearch()
})
watch(activeFilter, () => loadResellers(1))

// Handle page change
function handlePageChange (page: number) {
  loadResellers(page)
}

// Handle view
function handleView (reseller: Reseller) {
  navigateTo(localePath(`/admin/resellers/${reseller.id}`))
}

// Handle edit
function handleEdit (reseller: Reseller) {
  navigateTo(localePath(`/admin/resellers/${reseller.id}`))
}

// Handle credits
function handleCredits (reseller: Reseller) {
  navigateTo(localePath(`/admin/resellers/${reseller.id}/credits`))
}

// Handle delete
function openDeleteModal (reseller: Reseller) {
  resellerToDelete.value = reseller
  deleteModalOpen.value = true
}

async function confirmDelete () {
  if (!resellerToDelete.value) { return }

  const success = await deactivateReseller(resellerToDelete.value.id)
  if (success) {
    toast.add({
      title: t('admin.resellers.deactivateSuccess'),
      color: 'success'
    })
    await loadResellers(pagination.value.currentPage)
  } else {
    toast.add({
      title: t('admin.resellers.deactivateError'),
      color: 'error'
    })
  }

  deleteModalOpen.value = false
  resellerToDelete.value = null
}

// Filter options
const statusOptions = [
  { label: t('admin.resellers.filters.all'), value: undefined },
  { label: t('admin.resellers.filters.active'), value: true },
  { label: t('admin.resellers.filters.inactive'), value: false }
]
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.resellers.list.title') }}
        </h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          {{ t('admin.resellers.list.subtitle') }}
        </p>
      </div>
      <UButton
        :to="localePath('/admin/resellers/create')"
        color="primary"
        icon="i-lucide-plus"
      >
        {{ t('admin.resellers.create.button') }}
      </UButton>
    </div>

    <!-- Filters -->
    <UCard>
      <div class="flex flex-wrap gap-4">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          :placeholder="t('admin.resellers.filters.searchPlaceholder')"
          class="w-full md:w-80"
        />
        <USelect
          v-model="activeFilter"
          :items="statusOptions"
          value-key="value"
          :placeholder="t('admin.resellers.filters.status')"
          class="w-40"
        />
      </div>
    </UCard>

    <!-- Error -->
    <UAlert v-if="error" color="error" :title="t('common.error')">
      {{ error }}
    </UAlert>

    <!-- Table -->
    <UCard :ui="{ body: 'p-0' }">
      <AdminResellerTable
        :resellers="resellers"
        :loading="loading"
        @view="handleView"
        @edit="handleEdit"
        @credits="handleCredits"
        @delete="openDeleteModal"
      />

      <!-- Empty state -->
      <div
        v-if="!loading && resellers.length === 0"
        class="py-12 text-center"
      >
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <UIcon name="i-lucide-building-2" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
          {{ t('admin.resellers.list.noResellers') }}
        </h3>
        <p class="mb-4 text-gray-500">
          {{ t('admin.resellers.list.noResellersDescription') }}
        </p>
        <UButton
          :to="localePath('/admin/resellers/create')"
          color="primary"
          icon="i-lucide-plus"
        >
          {{ t('admin.resellers.create.button') }}
        </UButton>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.lastPage > 1"
        class="flex justify-center p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <UPagination
          :default-page="pagination.currentPage"
          :total="pagination.total"
          :items-per-page="pagination.perPage"
          @update:page="handlePageChange"
        />
      </div>
    </UCard>

    <!-- Delete Modal -->
    <AdminResellerDeleteModal
      v-model:open="deleteModalOpen"
      :reseller="resellerToDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
