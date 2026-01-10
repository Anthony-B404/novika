<script setup lang="ts">
import type { OrphanDecision } from "~/stores/gdpr";

definePageMeta({
  middleware: ["auth", "pending-deletion"],
});

const { t } = useI18n();

useSeoMeta({
  title: t("seo.settingsPrivacy.title"),
  description: t("seo.settingsPrivacy.description"),
});

const toast = useToast();
const gdprStore = useGdprStore();

// Modal state
const showOrphanModal = ref(false);

// Load data on mount
onMounted(async () => {
  await Promise.all([
    gdprStore.fetchDataSummary(),
    gdprStore.fetchDeletionStatus(),
  ]);
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

// Request deletion
async function handleRequestDeletion() {
  // First check for orphan organizations
  await gdprStore.fetchOrphanOrganizations();

  if (gdprStore.hasOrphanOrganizations) {
    showOrphanModal.value = true;
  } else {
    await submitDeletionRequest([]);
  }
}

// Submit deletion request with decisions
async function submitDeletionRequest(decisions: OrphanDecision[]) {
  try {
    await gdprStore.requestDeletion(decisions);
    showOrphanModal.value = false;
    toast.add({
      title: t("pages.dashboard.settings.privacy.deletion.pendingTitle"),
      color: "success",
    });
  } catch {
    toast.add({
      title: t("pages.dashboard.settings.privacy.errors.requestDeletion"),
      color: "error",
    });
  }
}

// Format date for display
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}

// Format bytes to MB
function formatSize(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(2);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <UPageCard
      :title="t('pages.dashboard.settings.privacy.title')"
      :description="t('pages.dashboard.settings.privacy.description')"
    >
      <template #icon>
        <UIcon name="i-lucide-shield-check" class="text-primary-500 size-6" />
      </template>
    </UPageCard>

    <!-- Data Summary -->
    <UPageCard
      :title="t('pages.dashboard.settings.privacy.summary.title')"
      class="from-primary/5 to-default bg-gradient-to-tl from-5%"
    >
      <div v-if="gdprStore.loading.summary" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-gray-400" />
      </div>

      <div v-else-if="gdprStore.dataSummary" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Profile -->
        <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <div class="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <UIcon name="i-lucide-user" class="size-4" />
            {{ t("pages.dashboard.settings.privacy.summary.profile") }}
          </div>
          <div class="mt-2 space-y-1 text-sm">
            <p><span class="text-gray-500">{{ t("pages.dashboard.settings.privacy.summary.email") }}:</span> {{ gdprStore.dataSummary.profile.email }}</p>
            <p v-if="gdprStore.dataSummary.profile.fullName">
              <span class="text-gray-500">{{ t("pages.dashboard.settings.privacy.summary.name") }}:</span> {{ gdprStore.dataSummary.profile.fullName }}
            </p>
            <p>
              <span class="text-gray-500">{{ t("pages.dashboard.settings.privacy.summary.createdAt") }}:</span>
              {{ formatDate(gdprStore.dataSummary.profile.createdAt) }}
            </p>
          </div>
        </div>

        <!-- Organizations -->
        <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <div class="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <UIcon name="i-lucide-building" class="size-4" />
            {{ t("pages.dashboard.settings.privacy.summary.organizations") }}
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold">{{ gdprStore.dataSummary.organizations.count }}</p>
            <p class="text-sm text-gray-500">
              {{ t("pages.dashboard.settings.privacy.summary.organizationsCount", gdprStore.dataSummary.organizations.count) }}
            </p>
          </div>
        </div>

        <!-- Audio Files -->
        <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <div class="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <UIcon name="i-lucide-music" class="size-4" />
            {{ t("pages.dashboard.settings.privacy.summary.audios") }}
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold">{{ gdprStore.dataSummary.audios.count }}</p>
            <p class="text-sm text-gray-500">
              {{ t("pages.dashboard.settings.privacy.summary.audiosCount", gdprStore.dataSummary.audios.count) }}
            </p>
            <p v-if="gdprStore.dataSummary.audios.totalDuration > 0" class="text-xs text-gray-400">
              {{ t("pages.dashboard.settings.privacy.summary.totalDuration", { duration: Math.round(gdprStore.dataSummary.audios.totalDuration / 60) }) }}
            </p>
            <p v-if="gdprStore.dataSummary.audios.totalSize > 0" class="text-xs text-gray-400">
              {{ t("pages.dashboard.settings.privacy.summary.totalSize", { size: formatSize(gdprStore.dataSummary.audios.totalSize) }) }}
            </p>
          </div>
        </div>

        <!-- Transcriptions -->
        <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <div class="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <UIcon name="i-lucide-file-text" class="size-4" />
            {{ t("pages.dashboard.settings.privacy.summary.transcriptions") }}
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold">{{ gdprStore.dataSummary.transcriptions.count }}</p>
            <p class="text-sm text-gray-500">
              {{ t("pages.dashboard.settings.privacy.summary.transcriptionsCount", gdprStore.dataSummary.transcriptions.count) }}
            </p>
          </div>
        </div>

        <!-- Documents -->
        <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <div class="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <UIcon name="i-lucide-file" class="size-4" />
            {{ t("pages.dashboard.settings.privacy.summary.documents") }}
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold">{{ gdprStore.dataSummary.documents.count }}</p>
            <p class="text-sm text-gray-500">
              {{ t("pages.dashboard.settings.privacy.summary.documentsCount", gdprStore.dataSummary.documents.count) }}
            </p>
          </div>
        </div>

        <!-- Credits -->
        <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <div class="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <UIcon name="i-lucide-coins" class="size-4" />
            {{ t("pages.dashboard.settings.privacy.summary.credits") }}
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold">{{ gdprStore.dataSummary.credits.balance }}</p>
            <p class="text-sm text-gray-500">
              {{ t("pages.dashboard.settings.privacy.summary.creditsBalance", gdprStore.dataSummary.credits.balance) }}
            </p>
            <p class="text-xs text-gray-400">
              {{ t("pages.dashboard.settings.privacy.summary.transactionsCount", gdprStore.dataSummary.credits.transactionsCount) }}
            </p>
          </div>
        </div>
      </div>
    </UPageCard>

    <!-- Export Section -->
    <UPageCard
      :title="t('pages.dashboard.settings.privacy.export.title')"
      :description="t('pages.dashboard.settings.privacy.export.description')"
    >
      <template #footer>
        <UButton
          :label="gdprStore.loading.export
            ? t('pages.dashboard.settings.privacy.export.loading')
            : t('pages.dashboard.settings.privacy.export.button')"
          icon="i-lucide-download"
          :loading="gdprStore.loading.export"
          @click="handleExport"
        />
      </template>
    </UPageCard>

    <!-- Deletion Section -->
    <UPageCard
      :title="t('pages.dashboard.settings.privacy.deletion.title')"
      :description="t('pages.dashboard.settings.privacy.deletion.description')"
      class="from-error/10 to-default bg-gradient-to-tl from-5%"
    >
      <!-- Warning -->
      <UAlert
        :description="t('pages.dashboard.settings.privacy.deletion.warning')"
        color="error"
        icon="i-lucide-alert-triangle"
        class="mb-4"
      />

      <template #footer>
        <UButton
          :label="gdprStore.loading.deletion
            ? t('pages.dashboard.settings.privacy.deletion.loading')
            : t('pages.dashboard.settings.privacy.deletion.button')"
          icon="i-lucide-trash-2"
          color="error"
          :loading="gdprStore.loading.deletion"
          @click="handleRequestDeletion"
        />
      </template>
    </UPageCard>

    <!-- Orphan Organizations Modal -->
    <SettingsOrphanOrgsModal
      v-model:open="showOrphanModal"
      :organizations="gdprStore.orphanOrganizations"
      :loading="gdprStore.loading.deletion"
      @confirm="submitDeletionRequest"
    />
  </div>
</template>
