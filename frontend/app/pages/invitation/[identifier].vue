<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { $localePath } = useNuxtApp();
const toast = useToast();
const { login } = useAuth();
const api = useApi();
const config = useRuntimeConfig();

definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: t("seo.acceptInvitation.title"),
  description: t("seo.acceptInvitation.description"),
});

const identifier = ref(route.params.identifier as string);
const isVerifying = ref(true);
const isValid = ref(false);
const userExists = ref(false);
const invitationData = ref<{
  email: string;
  organizationName: string;
  organizationLogo: string | null;
} | null>(null);
const fileRef = ref<HTMLInputElement>();

// Verify invitation on mount
onMounted(async () => {
  if (!identifier.value) {
    toast.add({
      title: t("auth.acceptInvitation.error"),
      description: t("auth.acceptInvitation.noIdentifier"),
      color: "error",
    });
    router.push($localePath("signup"));
    return;
  }

  try {
    const response = await api<{
      email: string;
      organizationName: string;
      organizationLogo: string | null;
      userExists: boolean;
    }>(`/check-invitation/${identifier.value}`);

    invitationData.value = {
      email: response.email,
      organizationName: response.organizationName,
      organizationLogo: response.organizationLogo,
    };
    userExists.value = response.userExists;
    isValid.value = true;
  } catch (error: any) {
    toast.add({
      title: t("auth.acceptInvitation.error"),
      description:
        error.data?.message || t("auth.acceptInvitation.invalidInvitation"),
      color: "error",
    });
    router.push($localePath("signup"));
  } finally {
    isVerifying.value = false;
  }
});

const schema = z.object({
  firstName: z.preprocess(
    (val) => val ?? "",
    z.string().superRefine((val, ctx) => {
      if (!val || val.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: t("auth.validation.firstNameRequired"),
        });
      } else if (val.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: t("auth.validation.firstNameTooShort"),
        });
      }
    }),
  ),
  lastName: z.preprocess(
    (val) => val ?? "",
    z.string().superRefine((val, ctx) => {
      if (!val || val.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: t("auth.validation.lastNameRequired"),
        });
      } else if (val.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: t("auth.validation.lastNameTooShort"),
        });
      }
    }),
  ),
  avatar: z.any().optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  firstName: undefined,
  lastName: undefined,
  avatar: undefined,
});

// Avatar management functions
function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  state.avatar = URL.createObjectURL(input.files[0]!);
}

function onFileClick() {
  fileRef.value?.click();
}

function onRemoveAvatar() {
  state.avatar = undefined;
  // Clear file input
  if (fileRef.value) {
    fileRef.value.value = "";
  }
}

// Get avatar URL (for preview)
const avatarUrl = computed(() => {
  if (!state.avatar) return undefined;

  // If it's a blob URL (local preview), use it directly
  if (state.avatar.startsWith("blob:")) {
    return state.avatar;
  }

  return state.avatar;
});

// Compute full name for display
const fullName = computed(() => {
  return `${state.firstName || ""} ${state.lastName || ""}`.trim();
});

// Compute organization logo URL
const organizationLogoUrl = computed(() => {
  if (!invitationData.value?.organizationLogo) return null;
  return `${config.public.apiUrl}/${invitationData.value.organizationLogo}`;
});

async function onSubmit(event?: FormSubmitEvent<Schema>) {
  try {
    // Prepare FormData
    const formData = new FormData();
    formData.append("identifier", identifier.value);

    // Add firstName, lastName, and avatar only for new users
    if (!userExists.value && event?.data) {
      formData.append("firstName", event.data.firstName);
      formData.append("lastName", event.data.lastName);

      // Add avatar if file was selected
      const fileInput = fileRef.value;
      if (fileInput?.files && fileInput.files.length > 0) {
        formData.append("avatar", fileInput.files[0]);
      }
    }

    const response = await api<{ token: string; message: string }>(
      "/accept-invitation",
      {
        method: "POST",
        body: formData,
      },
    );

    // Store token using auth store
    await login(response.token);

    toast.add({
      title: t("auth.acceptInvitation.success"),
      description: t("auth.acceptInvitation.successDescription"),
      color: "success",
    });

    // Redirect to dashboard
    router.push($localePath("dashboard"));
  } catch (error: any) {
    toast.add({
      title: t("auth.acceptInvitation.error"),
      description:
        error.data?.message || t("auth.acceptInvitation.errorDescription"),
      color: "error",
    });
  }
}
</script>

<template>
  <div v-if="isVerifying" class="flex items-center justify-center py-12">
    <UIcon name="i-lucide-loader-2" class="text-primary h-8 w-8 animate-spin" />
  </div>

  <div v-else-if="isValid" class="mx-auto w-full max-w-4xl px-6">
    <div class="mb-10 text-center">
      <div class="mb-6 flex justify-center">
        <UAvatar
          v-if="organizationLogoUrl"
          :src="organizationLogoUrl"
          size="3xl"
        />
        <div v-else class="bg-primary/10 rounded-full p-4">
          <UIcon name="i-lucide-building-2" class="text-primary h-8 w-8" />
        </div>
      </div>
      <h1 class="text-foreground mb-3 text-3xl font-bold tracking-tight">
        {{ $t("auth.acceptInvitation.title") }}
      </h1>
      <p class="text-muted-foreground text-base">
        {{
          $t("auth.acceptInvitation.description", {
            organization: invitationData?.organizationName,
          })
        }}
      </p>
      <p
        v-if="invitationData"
        class="text-muted-foreground mt-2 text-sm font-medium"
      >
        {{ invitationData.email }}
      </p>
    </div>

    <!-- Existing User: Direct acceptance -->
    <div v-if="userExists" class="space-y-6 text-center">
      <div class="bg-muted rounded-lg p-6">
        <h2 class="text-foreground mb-2 text-xl font-semibold">
          {{ $t("auth.acceptInvitation.existingUser.title") }}
        </h2>
        <p class="text-muted-foreground mb-6">
          {{
            $t("auth.acceptInvitation.existingUser.description", {
              organization: invitationData?.organizationName,
            })
          }}
        </p>
        <UButton @click="onSubmit()" block size="lg">
          {{ $t("auth.acceptInvitation.existingUser.button") }}
        </UButton>
      </div>
    </div>

    <!-- New User: Full form -->
    <UForm
      v-else
      :schema="schema"
      :state="state"
      class="space-y-5"
      @submit="onSubmit"
    >
      <UFormField :label="$t('auth.acceptInvitation.firstName')" name="firstName">
        <UInput
          v-model="state.firstName"
          :placeholder="$t('auth.acceptInvitation.firstNamePlaceholder')"
          class="w-full"
          size="lg"
        />
      </UFormField>

      <UFormField :label="$t('auth.acceptInvitation.lastName')" name="lastName">
        <UInput
          v-model="state.lastName"
          :placeholder="$t('auth.acceptInvitation.lastNamePlaceholder')"
          class="w-full"
          size="lg"
        />
      </UFormField>

      <UFormField :label="$t('auth.acceptInvitation.avatar')" name="avatar">
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar :src="avatarUrl" :alt="fullName || 'Avatar'" size="lg" />
          <UButton
            :label="t('common.buttons.choose')"
            color="neutral"
            @click="onFileClick"
          />
          <UButton
            v-if="state.avatar"
            :label="t('common.actions.remove')"
            color="error"
            variant="ghost"
            @click="onRemoveAvatar"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          />
        </div>
      </UFormField>

      <UButton type="submit" block class="mt-6" size="lg">
        {{ $t("auth.acceptInvitation.submitButton") }}
      </UButton>
    </UForm>
  </div>
</template>
