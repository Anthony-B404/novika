<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { t } = useI18n();

definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: t("seo.signup.title"),
  description: t("seo.signup.description"),
});

const toast = useToast();

const fields = computed(() => [
  {
    name: "name",
    type: "text" as const,
    label: t("auth.signup.name"),
    placeholder: t("auth.signup.namePlaceholder"),
    required: true,
  },
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
    label: t("auth.login.providers.google"),
    icon: "i-simple-icons-google",
    onClick: () => {
      toast.add({ title: t("auth.login.providers.google"), description: t("auth.login.providers.googleDescription") });
    },
  },
  {
    label: t("auth.login.providers.github"),
    icon: "i-simple-icons-github",
    onClick: () => {
      toast.add({ title: t("auth.login.providers.github"), description: t("auth.login.providers.githubDescription") });
    },
  },
]);

const schema = z.object({
  name: z.string().min(1, t("auth.validation.nameRequired")),
  email: z.string().email(t("auth.validation.invalidEmail")),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    // TODO: Replace with actual API call
    // await $fetch('/api/auth/signup-magic-link', {
    //   method: 'POST',
    //   body: { name: payload.data.name, email: payload.data.email }
    // })

    toast.add({
      title: t("auth.signup.success"),
      description: t("auth.signup.successDescription", { email: payload.data.email }),
      color: "green",
    });
  } catch (error) {
    toast.add({
      title: t("auth.signup.error"),
      description: t("auth.signup.errorDescription"),
      color: "red",
    });
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    :title="$t('auth.signup.title')"
    icon="i-lucide-mail"
    :submit="{ label: $t('auth.signup.submitButton') }"
    @submit="onSubmit"
  >
    <template #description>
      {{ $t('auth.signup.description') }}
      <ULink :to="$localePath('login')" class="text-primary font-medium">{{ $t('auth.signup.loginLink') }}</ULink>.
    </template>

    <template #footer>
      {{ $t('auth.signup.footer') }}
      <ULink :to="$localePath('index')" class="text-primary font-medium">{{ $t('auth.signup.termsOfService') }}</ULink>.
    </template>
  </UAuthForm>
</template>
