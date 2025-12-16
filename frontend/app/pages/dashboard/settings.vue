<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

definePageMeta({
  middleware: "auth",
});

const { t } = useI18n();
const localePath = useLocalePath();
const { canAccessOrganization, canAccessBilling } = useSettingsPermissions();

const links = computed(() => {
  const mainLinks: NavigationMenuItem[] = [
    {
      label: t("pages.dashboard.settings.navigation.general"),
      icon: "i-lucide-user",
      to: localePath("/dashboard/settings"),
      exact: true,
    },
  ];

  // Organization - Owner only
  if (canAccessOrganization.value) {
    mainLinks.push({
      label: t("pages.dashboard.settings.navigation.organization"),
      icon: "i-lucide-building",
      to: localePath("/dashboard/settings/organization"),
    });
  }

  // Members - All roles can view
  mainLinks.push({
    label: t("pages.dashboard.settings.navigation.members"),
    icon: "i-lucide-users",
    to: localePath("/dashboard/settings/members"),
  });

  // Notifications - All roles
  mainLinks.push({
    label: t("pages.dashboard.settings.navigation.notifications"),
    icon: "i-lucide-bell",
    to: localePath("/dashboard/settings/notifications"),
  });

  // Security - All roles
  mainLinks.push({
    label: t("pages.dashboard.settings.navigation.security"),
    icon: "i-lucide-shield",
    to: localePath("/dashboard/settings/security"),
  });

  // Billing - Owner only
  if (canAccessBilling.value) {
    mainLinks.push({
      label: t("pages.dashboard.settings.navigation.billing"),
      icon: "i-lucide-credit-card",
      to: localePath("/dashboard/settings/billing"),
    });
  }

  return [mainLinks] satisfies NavigationMenuItem[][];
});
</script>

<template>
  <UDashboardPanel id="settings" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar :title="t('pages.dashboard.settings.title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div
        class="mx-auto flex w-full flex-col gap-4 sm:gap-6 lg:max-w-2xl lg:gap-12"
      >
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
