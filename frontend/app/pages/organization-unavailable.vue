<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: "auth",
});

const { t, d } = useI18n();
const { $localePath } = useNuxtApp();
const { logout } = useAuth();
const organizationStore = useOrganizationStore();

useSeoMeta({
  title: t("seo.organizationUnavailable.title"),
  description: t("seo.organizationUnavailable.description"),
});

// Load organization on mount
onMounted(async () => {
  await organizationStore.fetchOrganization();

  // If organization is available, redirect to dashboard
  if (!organizationStore.isOrganizationUnavailable) {
    navigateTo($localePath("/dashboard"));
  }
});

// Computed: page title based on status
const pageTitle = computed(() => {
  if (organizationStore.isOrganizationDeleted) {
    return t("pages.organizationUnavailable.deletedTitle");
  }
  if (organizationStore.isOrganizationSuspended) {
    return t("pages.organizationUnavailable.suspendedTitle");
  }
  return t("pages.organizationUnavailable.title");
});

// Computed: description based on status
const pageDescription = computed(() => {
  if (organizationStore.isOrganizationDeleted) {
    return t("pages.organizationUnavailable.deletedDescription");
  }
  if (organizationStore.isOrganizationSuspended) {
    return t("pages.organizationUnavailable.suspendedDescription");
  }
  return "";
});

// Computed: formatted date for suspended/deleted
const statusDate = computed(() => {
  if (organizationStore.isOrganizationDeleted && organizationStore.deletedAt) {
    return d(new Date(organizationStore.deletedAt), "long");
  }
  if (organizationStore.isOrganizationSuspended && organizationStore.suspendedAt) {
    return d(new Date(organizationStore.suspendedAt), "long");
  }
  return null;
});

// Computed: days until purge for deleted organizations
const daysUntilPurge = computed(() => {
  if (!organizationStore.isOrganizationDeleted || !organizationStore.deletedAt) {
    return null;
  }
  const deletedDate = new Date(organizationStore.deletedAt);
  const purgeDate = new Date(deletedDate);
  purgeDate.setDate(purgeDate.getDate() + 30);
  const now = new Date();
  const diffTime = purgeDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Handle logout
async function handleLogout() {
  await logout();
  navigateTo($localePath("/"));
}
</script>

<template>
  <div class="space-y-6 w-full">
    <!-- Header -->
    <div class="text-center">
      <div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" :class="[
        organizationStore.isOrganizationDeleted
          ? 'bg-error-100 dark:bg-error-900/30'
          : 'bg-warning-100 dark:bg-warning-900/30'
      ]">
        <UIcon
          :name="organizationStore.isOrganizationDeleted ? 'i-lucide-trash-2' : 'i-lucide-pause-circle'"
          class="w-8 h-8"
          :class="[
            organizationStore.isOrganizationDeleted
              ? 'text-error-500'
              : 'text-warning-500'
          ]"
        />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ pageTitle }}
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {{ pageDescription }}
      </p>
    </div>

    <!-- Status Details -->
    <div class="space-y-3">
      <!-- Suspension Reason (if available) -->
      <UAlert
        v-if="organizationStore.isOrganizationSuspended && organizationStore.suspensionReason"
        :title="t('pages.organizationUnavailable.reason')"
        :description="organizationStore.suspensionReason"
        color="warning"
        icon="i-lucide-info"
      />

      <!-- Status Date -->
      <UAlert
        v-if="statusDate"
        :title="organizationStore.isOrganizationDeleted
          ? t('pages.organizationUnavailable.deletedOn')
          : t('pages.organizationUnavailable.suspendedOn')"
        :description="statusDate"
        :color="organizationStore.isOrganizationDeleted ? 'error' : 'warning'"
        icon="i-lucide-calendar"
      />

      <!-- Days until purge (for deleted organizations) -->
      <UAlert
        v-if="organizationStore.isOrganizationDeleted && daysUntilPurge !== null"
        :description="t('pages.organizationUnavailable.daysUntilPurge', { days: daysUntilPurge })"
        color="error"
        icon="i-lucide-clock"
      />
    </div>

    <!-- Actions -->
    <div class="space-y-3">
      <!-- Contact Reseller - Primary action (no reactivation option unlike pending-deletion) -->
      <UButton
        :label="t('pages.organizationUnavailable.contactReseller')"
        icon="i-lucide-mail"
        color="primary"
        size="lg"
        block
        tag="a"
        href="mailto:support@dh-echo.app"
      />

      <!-- Logout -->
      <UButton
        :label="t('pages.organizationUnavailable.logout')"
        icon="i-lucide-log-out"
        color="neutral"
        variant="ghost"
        size="lg"
        block
        @click="handleLogout"
      />
    </div>

    <!-- Info Text -->
    <p class="text-sm text-center text-gray-500 dark:text-gray-400">
      {{ t("pages.organizationUnavailable.info") }}
    </p>
  </div>
</template>
