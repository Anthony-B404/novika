<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { t, locale, setLocale } = useI18n();
const localePath = useLocalePath();
const { user: authUser, logout } = useAuth();
const { getAvatarUrl } = useAvatarUrl();
const { canAccessOrganization, canManageMembers } = useSettingsPermissions();

defineProps<{
  collapsed?: boolean;
}>();

const colorMode = useColorMode();

const user = computed(() => ({
  name: authUser.value?.fullName || authUser.value?.email || "User",
  avatar: {
    src: getAvatarUrl(authUser.value?.avatar),
    alt: authUser.value?.fullName || authUser.value?.email || "User",
  },
}));

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: "label",
      label: user.value.name,
      avatar: user.value.avatar,
    },
  ],
  [
    {
      label: t("components.user.settings"),
      icon: "i-lucide-settings",
      children: [
        {
          label: t("pages.dashboard.settings.navigation.general"),
          icon: "i-lucide-sliders",
          to: localePath("/dashboard/settings"),
          exact: true,
        },
        ...(canAccessOrganization.value
          ? [
              {
                label: t("pages.dashboard.settings.navigation.organization"),
                icon: "i-lucide-building",
                to: localePath("/dashboard/settings/organization"),
              },
            ]
          : []),
        ...(canManageMembers.value
          ? [
              {
                label: t("pages.dashboard.settings.navigation.members"),
                icon: "i-lucide-users",
                to: localePath("/dashboard/settings/members"),
              },
            ]
          : []),
        {
          label: t("pages.dashboard.settings.navigation.privacy"),
          icon: "i-lucide-shield-check",
          to: localePath("/dashboard/settings/privacy"),
        },
      ],
    },
  ],
  [
    {
      label: t("components.user.appearance"),
      icon: "i-lucide-sun-moon",
      children: [
        {
          label: t("components.user.light"),
          icon: "i-lucide-sun",
          type: "checkbox",
          checked: colorMode.preference === "light",
          onSelect(e: Event) {
            e.preventDefault();
            colorMode.preference = "light";
          },
        },
        {
          label: t("components.user.dark"),
          icon: "i-lucide-moon",
          type: "checkbox",
          checked: colorMode.preference === "dark",
          onSelect(e: Event) {
            e.preventDefault();
            colorMode.preference = "dark";
          },
        },
        {
          label: t("components.user.system"),
          icon: "i-lucide-monitor",
          type: "checkbox",
          checked: colorMode.preference === "system",
          onSelect(e: Event) {
            e.preventDefault();
            colorMode.preference = "system";
          },
        },
      ],
    },
  ],
  [
    {
      label: t("footer.language.label"),
      icon: "i-lucide-languages",
      children: [
        {
          label: "Français",
          type: "checkbox",
          checked: locale.value === "fr",
          onSelect(e: Event) {
            e.preventDefault();
            setLocale("fr");
          },
        },
        {
          label: "English",
          type: "checkbox",
          checked: locale.value === "en",
          onSelect(e: Event) {
            e.preventDefault();
            setLocale("en");
          },
        },
      ],
    },
  ],
  [
    {
      label: t("components.user.logOut"),
      icon: "i-lucide-log-out",
      onSelect: async () => {
        await logout();
      },
    },
  ],
]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)',
    }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />

  </UDropdownMenu>
</template>
