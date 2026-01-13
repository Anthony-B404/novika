<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { $localePath } = useNuxtApp();
const toast = useToast();
const { t } = useI18n();
const { login, user } = useAuth();

definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: t("seo.oauthCallback.title"),
  description: t("seo.oauthCallback.description"),
});

onMounted(async () => {
  // Debug logs
  console.log("Callback - Query params:", route.query);

  const token = route.query.token as string;
  const needsOnboarding = route.query.needsOnboarding === "true";
  const error = route.query.error as string;

  console.log("Callback - Token:", token);
  console.log("Callback - NeedsOnboarding:", needsOnboarding);
  console.log("Callback - Error:", error);

  // Handle OAuth errors
  if (error) {
    let errorMessage = t("auth.login.error");

    switch (error) {
      case "access_denied":
        errorMessage = t("auth.social.access_denied");
        break;
      case "oauth_error":
        errorMessage = t("auth.social.error");
        break;
    }

    toast.add({
      title: t("auth.login.error"),
      description: errorMessage,
      color: "error",
    });

    await router.push($localePath("index"));
    return;
  }

  // Handle successful authentication
  if (token) {
    // Store token using auth store
    await login(token);
    console.log("Callback - Token stored via auth store");

    toast.add({
      title: t("auth.social.google_success"),
      color: "success",
    });

    // Small delay to ensure toast is visible
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (needsOnboarding) {
      console.log("Callback - Redirecting to complete-oauth-signup");
      await router.push($localePath("complete-oauth-signup"));
    } else if (user.value?.isSuperAdmin) {
      console.log("Callback - Redirecting to admin (superadmin)");
      await router.push($localePath("/admin"));
    } else {
      console.log("Callback - Redirecting to dashboard");
      await router.push($localePath("dashboard"));
    }
  } else {
    // No token received
    console.error("Callback - No token received");
    toast.add({
      title: t("auth.login.error"),
      description: t("auth.login.errorDescription"),
      color: "error",
    });

    await router.push($localePath("index"));
  }
});
</script>

<template>
  <div class="flex w-full max-w-3xl items-center justify-center">
    <div class="text-center">
      <UIcon name="i-lucide-loader-circle" class="mb-4 animate-spin text-4xl" />
      <p>{{ $t("auth.login.processing") }}</p>
    </div>
  </div>
</template>
