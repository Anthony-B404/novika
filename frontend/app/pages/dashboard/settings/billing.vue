<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { t } = useI18n();
const { authenticatedFetch } = useAuth();
const route = useRoute();
const router = useRouter();
const toast = useToast();

// State
const loading = ref(true);
const checkoutLoading = ref(false);
const subscriptionStatus = ref<{
  hasSubscription: boolean;
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    isActive: boolean;
  } | null;
} | null>(null);

// Check for success redirect from Lemon Squeezy
const isSuccess = computed(() => route.query.success === "true");

// Fetch subscription status
const fetchSubscriptionStatus = async () => {
  try {
    loading.value = true;
    subscriptionStatus.value = await authenticatedFetch<typeof subscriptionStatus.value>(
      "/billing/status"
    );
  } catch (error) {
    console.error("Failed to fetch subscription status:", error);
    toast.add({
      title: t("pages.dashboard.settings.billing.error.fetchFailed"),
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    loading.value = false;
  }
};

// Create checkout session
const handleSubscribe = async () => {
  try {
    checkoutLoading.value = true;
    const response = await authenticatedFetch<{ checkoutUrl: string }>(
      "/billing/checkout",
      { method: "POST" }
    );

    // Redirect to Lemon Squeezy checkout
    window.location.href = response.checkoutUrl;
  } catch (error: any) {
    console.error("Failed to create checkout:", error);
    toast.add({
      title: t("pages.dashboard.settings.billing.error.checkoutFailed"),
      description: error.data?.message,
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    checkoutLoading.value = false;
  }
};

// Format date helper
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

// Status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
    case "on_trial":
      return "success";
    case "cancelled":
    case "expired":
      return "error";
    case "paused":
    case "past_due":
    case "unpaid":
      return "warning";
    default:
      return "neutral";
  }
};

// Show success toast on redirect
onMounted(async () => {
  await fetchSubscriptionStatus();

  if (isSuccess.value) {
    toast.add({
      title: t("pages.dashboard.settings.billing.success.subscribed"),
      color: "success",
      icon: "i-lucide-check",
    });
    // Clean URL
    router.replace({ query: {} });
  }
});
</script>

<template>
  <UPageCard
    :title="t('pages.dashboard.settings.billing.title')"
    :description="t('pages.dashboard.settings.billing.description')"
  >
    <div v-if="loading" class="flex items-center justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin" />
    </div>

    <template v-else>
      <!-- No subscription -->
      <div v-if="!subscriptionStatus?.hasSubscription" class="space-y-4">
        <UAlert
          :title="t('pages.dashboard.settings.billing.noSubscription.title')"
          :description="t('pages.dashboard.settings.billing.noSubscription.description')"
          color="info"
          icon="i-lucide-info"
        />

        <UButton
          :label="t('pages.dashboard.settings.billing.subscribe')"
          :loading="checkoutLoading"
          icon="i-lucide-credit-card"
          color="primary"
          @click="handleSubscribe"
        />
      </div>

      <!-- Has subscription -->
      <div v-else class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">
            {{ t("pages.dashboard.settings.billing.status") }}:
          </span>
          <UBadge :color="getStatusColor(subscriptionStatus.subscription?.status || '')">
            {{ t(`pages.dashboard.settings.billing.statuses.${subscriptionStatus.subscription?.status}`) }}
          </UBadge>
        </div>

        <div v-if="subscriptionStatus.subscription?.currentPeriodEnd" class="text-sm text-muted">
          <span class="font-medium">
            {{ t("pages.dashboard.settings.billing.renewsAt") }}:
          </span>
          {{ formatDate(subscriptionStatus.subscription.currentPeriodEnd) }}
        </div>
      </div>
    </template>
  </UPageCard>
</template>
