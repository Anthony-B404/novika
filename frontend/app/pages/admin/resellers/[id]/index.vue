<script setup lang="ts">
import type { Reseller, UpdateResellerPayload } from '~/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const toast = useToast()

const resellerId = computed(() => Number(route.params.id))

useSeoMeta({
  title: t('admin.resellers.detail.title'),
})

const { fetchReseller, updateReseller, loading, error } = useResellers()
const reseller = ref<Reseller | null>(null)
const isEditing = ref(false)

// Load reseller
onMounted(async () => {
  reseller.value = await fetchReseller(resellerId.value)
})

// Watch for route param changes (navigation between resellers)
watch(resellerId, async (newId) => {
  if (newId) {
    isEditing.value = false
    reseller.value = await fetchReseller(newId)
  }
})

async function handleSubmit(data: UpdateResellerPayload) {
  try {
    // Build payload with only changed fields
    const payload: UpdateResellerPayload = {}
    if (data.name !== reseller.value?.name) payload.name = data.name
    if (data.email !== reseller.value?.email) payload.email = data.email
    if (data.phone !== reseller.value?.phone) payload.phone = data.phone || null
    if (data.company !== reseller.value?.company) payload.company = data.company
    if (data.siret !== reseller.value?.siret) payload.siret = data.siret || null
    if (data.address !== reseller.value?.address) payload.address = data.address || null
    if (data.notes !== reseller.value?.notes) payload.notes = data.notes || null
    if (data.isActive !== reseller.value?.isActive) payload.isActive = data.isActive

    const result = await updateReseller(resellerId.value, payload)
    if (result) {
      reseller.value = result.reseller
      isEditing.value = false
      toast.add({
        title: t('admin.resellers.detail.updateSuccess'),
        color: 'success',
      })
    }
  } catch (e: unknown) {
    const errorMessage =
      e && typeof e === 'object' && 'data' in e
        ? (e as { data?: { message?: string } }).data?.message
        : undefined
    toast.add({
      title: t('admin.resellers.detail.updateError'),
      description: errorMessage,
      color: 'error',
    })
  }
}

function handleCancel() {
  isEditing.value = false
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="p-6">
    <!-- Loading -->
    <div v-if="loading && !reseller" class="flex items-center justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-500" />
    </div>

    <!-- Error -->
    <UAlert v-else-if="error && !reseller" color="error" :title="t('common.error')">
      {{ error }}
    </UAlert>

    <!-- Content -->
    <template v-else-if="reseller">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <UButton
            :to="localePath('/admin/resellers')"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            class="mb-4"
          >
            {{ t('common.buttons.back') }}
          </UButton>
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ reseller.name }}
            </h1>
            <UBadge :color="reseller.isActive ? 'success' : 'error'">
              {{
                reseller.isActive
                  ? t('admin.resellers.status.active')
                  : t('admin.resellers.status.inactive')
              }}
            </UBadge>
          </div>
          <p class="mt-1 text-gray-500 dark:text-gray-400">
            {{ reseller.company }}
          </p>
        </div>
        <div class="flex gap-2">
          <UButton
            :to="localePath(`/admin/resellers/${reseller.id}/credits`)"
            color="neutral"
            icon="i-lucide-coins"
          >
            {{ t('admin.resellers.detail.manageCredits') }}
          </UButton>
          <UButton
            v-if="!isEditing"
            color="primary"
            icon="i-lucide-edit"
            @click="isEditing = true"
          >
            {{ t('common.buttons.edit') }}
          </UButton>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Edit form or details -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold">{{ t('admin.resellers.detail.info') }}</h2>
              </div>
            </template>

            <AdminResellerForm
              v-if="isEditing"
              mode="edit"
              :loading="loading"
              :initial-data="{
                name: reseller.name,
                email: reseller.email,
                phone: reseller.phone || '',
                company: reseller.company,
                siret: reseller.siret || '',
                address: reseller.address || '',
                notes: reseller.notes || '',
                isActive: reseller.isActive,
              }"
              @submit="handleSubmit"
              @cancel="handleCancel"
            />

            <dl v-else class="divide-y divide-gray-100 dark:divide-gray-800">
              <div class="py-3 grid grid-cols-3 gap-4">
                <dt class="text-sm font-medium text-gray-500">
                  {{ t('admin.resellers.fields.email') }}
                </dt>
                <dd class="col-span-2 text-sm text-gray-900 dark:text-white">
                  {{ reseller.email }}
                </dd>
              </div>
              <div class="py-3 grid grid-cols-3 gap-4">
                <dt class="text-sm font-medium text-gray-500">
                  {{ t('admin.resellers.fields.phone') }}
                </dt>
                <dd class="col-span-2 text-sm text-gray-900 dark:text-white">
                  {{ reseller.phone || '-' }}
                </dd>
              </div>
              <div class="py-3 grid grid-cols-3 gap-4">
                <dt class="text-sm font-medium text-gray-500">
                  {{ t('admin.resellers.fields.siret') }}
                </dt>
                <dd class="col-span-2 text-sm text-gray-900 dark:text-white">
                  {{ reseller.siret || '-' }}
                </dd>
              </div>
              <div class="py-3 grid grid-cols-3 gap-4">
                <dt class="text-sm font-medium text-gray-500">
                  {{ t('admin.resellers.fields.address') }}
                </dt>
                <dd class="col-span-2 text-sm text-gray-900 dark:text-white">
                  {{ reseller.address || '-' }}
                </dd>
              </div>
              <div class="py-3 grid grid-cols-3 gap-4">
                <dt class="text-sm font-medium text-gray-500">
                  {{ t('admin.resellers.fields.notes') }}
                </dt>
                <dd class="col-span-2 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {{ reseller.notes || '-' }}
                </dd>
              </div>
              <div class="py-3 grid grid-cols-3 gap-4">
                <dt class="text-sm font-medium text-gray-500">
                  {{ t('admin.resellers.fields.createdAt') }}
                </dt>
                <dd class="col-span-2 text-sm text-gray-900 dark:text-white">
                  {{ formatDate(reseller.createdAt) }}
                </dd>
              </div>
            </dl>
          </UCard>

          <!-- Organizations -->
          <UCard v-if="reseller.organizations">
            <template #header>
              <h2 class="text-lg font-semibold">
                {{ t('admin.resellers.detail.organizations') }}
                <UBadge color="neutral" class="ml-2">{{ reseller.organizationsCount }}</UBadge>
              </h2>
            </template>

            <div
              v-if="reseller.organizations.length > 0"
              class="divide-y divide-gray-100 dark:divide-gray-800"
            >
              <div
                v-for="org in reseller.organizations"
                :key="org.id"
                class="py-3 flex items-center justify-between"
              >
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ org.name }}</p>
                  <p class="text-sm text-gray-500">{{ org.email }}</p>
                </div>
                <UBadge color="neutral">
                  {{ org.credits.toLocaleString() }} {{ t('common.credits') }}
                </UBadge>
              </div>
            </div>
            <div v-else class="py-8 text-center text-gray-500">
              {{ t('admin.resellers.detail.noOrganizations') }}
            </div>
          </UCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Credits card -->
          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">{{ t('admin.resellers.detail.creditBalance') }}</h2>
            </template>

            <div class="text-center py-4">
              <div class="text-4xl font-bold text-primary-500">
                {{ reseller.creditBalance.toLocaleString() }}
              </div>
              <div class="text-gray-500">{{ t('common.credits') }}</div>
            </div>

            <UButton
              :to="localePath(`/admin/resellers/${reseller.id}/credits`)"
              color="primary"
              block
              icon="i-lucide-plus"
            >
              {{ t('admin.resellers.detail.addCredits') }}
            </UButton>
          </UCard>

          <!-- Admin users -->
          <UCard v-if="reseller.adminUsers">
            <template #header>
              <h2 class="text-lg font-semibold">
                {{ t('admin.resellers.detail.adminUsers') }}
                <UBadge color="neutral" class="ml-2">{{ reseller.adminUsersCount }}</UBadge>
              </h2>
            </template>

            <div
              v-if="reseller.adminUsers.length > 0"
              class="divide-y divide-gray-100 dark:divide-gray-800"
            >
              <div v-for="user in reseller.adminUsers" :key="user.id" class="py-3">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ user.firstName }} {{ user.lastName }}
                </p>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
            </div>
            <div v-else class="py-4 text-center text-gray-500">
              {{ t('admin.resellers.detail.noAdminUsers') }}
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </div>
</template>
