<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  currentPeriodEnd: string | null;
}>();

const emit = defineEmits<{
  close: [];
  cancelled: [];
}>();

const { t } = useI18n();
const toast = useToast();
const { authenticatedFetch } = useAuth();

const loading = ref(false);

const formattedDate = computed(() => {
  if (!props.currentPeriodEnd) return "-";
  return new Date(props.currentPeriodEnd).toLocaleDateString();
});

async function onConfirm() {
  loading.value = true;

  try {
    await authenticatedFetch("/billing/cancel", {
      method: "POST",
    });

    toast.add({
      title: t("pages.dashboard.settings.billing.cancel.success"),
      color: "success",
      icon: "i-lucide-check",
    });

    emit("cancelled");
    emit("close");
  } catch (error: any) {
    toast.add({
      title: t("pages.dashboard.settings.billing.cancel.error"),
      description: error.data?.message,
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  emit("close");
}
</script>

<template>
  <UModal
    :open="open"
    :title="t('pages.dashboard.settings.billing.cancel.modal.title')"
    :ui="{ footer: 'justify-end' }"
    @update:open="(val) => !val && handleClose()"
  >
    <template #body>
      <p class="text-muted">
        {{ t("pages.dashboard.settings.billing.cancel.modal.description") }}
      </p>
      <UAlert
        class="mt-4"
        color="warning"
        icon="i-lucide-alert-triangle"
        :description="t('pages.dashboard.settings.billing.cancel.modal.warning', { date: formattedDate })"
      />
    </template>

    <template #footer>
      <UButton
        :label="t('common.buttons.cancel')"
        color="neutral"
        variant="outline"
        :disabled="loading"
        @click="handleClose"
      />
      <UButton
        :label="t('pages.dashboard.settings.billing.cancel.modal.confirm')"
        color="error"
        :loading="loading"
        @click="onConfirm"
      />
    </template>
  </UModal>
</template>
