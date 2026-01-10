<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: "auth",
});

const { t } = useI18n();

useSeoMeta({
  title: t("seo.pendingDeletion.title"),
  description: t("seo.pendingDeletion.description"),
});

const { $localePath } = useNuxtApp();
const toast = useToast();
const gdprStore = useGdprStore();
const { logout } = useAuth();

// Load deletion status on mount
onMounted(async () => {
  await gdprStore.fetchDeletionStatus();

  // If no pending deletion, redirect to dashboard
  if (!gdprStore.hasPendingDeletion) {
    navigateTo($localePath("/dashboard"));
  }
});

// Export data
async function handleExport() {
  try {
    await gdprStore.downloadExport();
    toast.add({
      title: t("pages.dashboard.settings.privacy.export.success"),
      color: "success",
    });
  } catch {
    toast.add({
      title: t("pages.dashboard.settings.privacy.export.error"),
      color: "error",
    });
  }
}

// Cancel deletion
async function handleCancelDeletion() {
  if (!gdprStore.pendingDeletionRequest?.token) return;

  try {
    await gdprStore.cancelDeletion(gdprStore.pendingDeletionRequest.token);
    toast.add({
      title: t("pages.dashboard.settings.privacy.deletion.cancelSuccess"),
      color: "success",
    });
    // Redirect to dashboard after cancellation
    navigateTo($localePath("/dashboard"));
  } catch {
    toast.add({
      title: t("pages.dashboard.settings.privacy.deletion.cancelError"),
      color: "error",
    });
  }
}

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
      <div class="mx-auto w-16 h-16 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center mb-4">
        <UIcon name="i-lucide-alert-octagon" class="w-8 h-8 text-error-500" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t("pages.pendingDeletion.title") }}
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {{ t("pages.pendingDeletion.description") }}
      </p>
    </div>

    <!-- Deletion Status Info -->
    <UAlert
      v-if="gdprStore.pendingDeletionRequest"
      :title="t('pages.dashboard.settings.privacy.deletion.pendingTitle')"
      :description="t('pages.dashboard.settings.privacy.deletion.pendingDescription', {
        date: gdprStore.pendingDeletionRequest.scheduledForFormatted,
        days: gdprStore.pendingDeletionRequest.daysRemaining
      })"
      color="warning"
      icon="i-lucide-clock"
    />

    <!-- Actions -->
    <div class="space-y-3">
      <!-- Cancel Deletion -->
      <UButton
        v-if="gdprStore.pendingDeletionRequest?.canBeCancelled"
        :label="t('pages.pendingDeletion.cancelDeletion')"
        icon="i-lucide-undo-2"
        color="primary"
        size="lg"
        block
        :loading="gdprStore.loading.cancel"
        @click="handleCancelDeletion"
      />

      <!-- Export Data -->
      <UButton
        :label="t('pages.pendingDeletion.exportData')"
        icon="i-lucide-download"
        color="neutral"
        variant="outline"
        size="lg"
        block
        :loading="gdprStore.loading.export"
        @click="handleExport"
      />

      <!-- Logout -->
      <UButton
        :label="t('pages.pendingDeletion.logout')"
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
      {{ t("pages.pendingDeletion.info") }}
    </p>
  </div>
</template>
