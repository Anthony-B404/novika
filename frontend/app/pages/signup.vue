<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { t } = useI18n();
const { $localePath } = useNuxtApp();
const { isAuthenticated, user } = useAuth();
const api = useApi();
const route = useRoute();

// Redirect based on authentication and onboarding status
onMounted(() => {
  if (isAuthenticated.value) {
    if (user.value && !user.value.onboardingCompleted) {
      navigateTo($localePath('complete-oauth-signup'));
    } else {
      navigateTo($localePath('dashboard'));
    }
  }
});

definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: t("seo.signup.title"),
  description: t("seo.signup.description"),
});

const toast = useToast();
const config = useRuntimeConfig();

// Pre-fill email from query parameter (e.g., when redirected from login with disabled account)
const initialState = reactive({
  email: (route.query.email as string) || "",
});

const fields = computed(() => [
  {
    name: "email",
    type: "text" as const,
    label: t("auth.signup.email"),
    placeholder: t("auth.signup.emailPlaceholder"),
    required: true,
  },
]);

const providers = computed(() => [
  {
    label: t("auth.signup.providers.google"),
    icon: "i-simple-icons-google",
    onClick: () => {
      window.location.href = `${config.public.apiUrl}/auth/google/redirect`;
    },
  },
]);

const schema = z.object({
  email: z.preprocess(
    (val) => val ?? "",
    z.string().superRefine((val, ctx) => {
      if (!val || val.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: t("auth.validation.emailRequired"),
        });
      } else if (!z.string().email().safeParse(val).success) {
        ctx.addIssue({
          code: "custom",
          message: t("auth.validation.invalidEmail"),
        });
      }
    })
  ),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    await api("/register/request-magic-link", {
      method: "POST",
      body: {
        email: payload.data.email,
      },
    });

    toast.add({
      title: t("auth.signup.success"),
      description: t("auth.signup.successDescription", {
        email: payload.data.email,
      }),
      color: "success",
    });
  } catch (error: any) {
    toast.add({
      title: t("auth.signup.error"),
      description: error.data?.message || t("auth.signup.errorDescription"),
      color: "error",
    });
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :state="initialState"
    :providers="providers"
    :title="$t('auth.signup.title')"
    icon="i-lucide-mail"
    :submit="{ label: $t('auth.signup.submitButton') }"
    @submit="onSubmit"
  >
    <template #description>
      {{ $t("auth.signup.description") }}
    </template>

    <template #footer>
      {{ $t("auth.signup.footer") }}
    </template>
  </UAuthForm>
</template>
