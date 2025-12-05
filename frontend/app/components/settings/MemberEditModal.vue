<script setup lang="ts">
import type { Member } from "~/types";
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
  member: Member | null;
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  updated: [];
}>();

const { t } = useI18n();
const toast = useToast();
const { authenticatedFetch } = useAuth();
const { getAvatarUrl } = useAvatarUrl();

const fileRef = ref<HTMLInputElement>();
const loading = ref(false);
const avatarRemoved = ref(false);

const schema = z.object({
  firstName: z
    .string()
    .min(2, t("pages.dashboard.settings.general.validation.firstNameTooShort")),
  lastName: z
    .string()
    .min(2, t("pages.dashboard.settings.general.validation.lastNameTooShort")),
  email: z
    .string()
    .email(t("pages.dashboard.settings.general.validation.invalidEmail")),
  avatar: z.string().optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  firstName: "",
  lastName: "",
  email: "",
  avatar: undefined,
});

// Watch for member changes to reset form state
watch(
  () => props.member,
  (newMember) => {
    if (newMember) {
      // Parse fullName into firstName/lastName if not available separately
      const nameParts = newMember.fullName?.split(" ") || ["", ""];
      state.firstName = nameParts[0] || "";
      state.lastName = nameParts.slice(1).join(" ") || "";
      state.email = newMember.email || "";
      state.avatar = newMember.avatar || undefined;
      avatarRemoved.value = false;
      // Clear file input
      if (fileRef.value) {
        fileRef.value.value = "";
      }
    }
  },
  { immediate: true },
);

// Watch for modal open to reset state
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.member) {
      const nameParts = props.member.fullName?.split(" ") || ["", ""];
      state.firstName = nameParts[0] || "";
      state.lastName = nameParts.slice(1).join(" ") || "";
      state.email = props.member.email || "";
      state.avatar = props.member.avatar || undefined;
      avatarRemoved.value = false;
      if (fileRef.value) {
        fileRef.value.value = "";
      }
    }
  },
);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!props.member) return;

  loading.value = true;

  try {
    const formData = new FormData();

    // Add text fields
    formData.append("firstName", event.data.firstName);
    formData.append("lastName", event.data.lastName);
    formData.append("email", event.data.email);

    // Add avatar removal flag
    if (avatarRemoved.value) {
      formData.append("removeAvatar", "true");
    }

    // Add avatar if file was selected
    const fileInput = fileRef.value;
    if (fileInput?.files && fileInput.files.length > 0) {
      formData.append("avatar", fileInput.files[0]);
    }

    await authenticatedFetch(`/update-member/${props.member.id}`, {
      method: "PUT",
      body: formData,
    });

    toast.add({
      title: t("components.settings.members.editModal.successTitle"),
      description: t("components.settings.members.editModal.successDescription"),
      color: "success",
    });

    emit("updated");
    emit("close");
  } catch (error: any) {
    toast.add({
      title: t("components.settings.members.editModal.errorTitle"),
      description:
        error.data?.message ||
        t("components.settings.members.editModal.errorDescription"),
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  state.avatar = URL.createObjectURL(input.files[0]!);
  avatarRemoved.value = false;
}

function onFileClick() {
  fileRef.value?.click();
}

function onRemoveAvatar() {
  state.avatar = undefined;
  avatarRemoved.value = true;
  if (fileRef.value) {
    fileRef.value.value = "";
  }
}

// Compute full name for display
const fullName = computed(() => {
  return `${state.firstName} ${state.lastName}`.trim();
});

const formRef = ref();

function handleClose() {
  emit("close");
}
</script>

<template>
  <UModal
    :open="open"
    :title="t('components.settings.members.editModal.title')"
    :description="t('components.settings.members.editModal.description')"
    :ui="{ footer: 'justify-end' }"
    @update:open="(val) => !val && handleClose()"
  >
    <template #body>
      <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          name="firstName"
          :label="t('pages.dashboard.settings.general.firstNameLabel')"
          required
        >
          <UInput
            v-model="state.firstName"
            autocomplete="given-name"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="lastName"
          :label="t('pages.dashboard.settings.general.lastNameLabel')"
          required
        >
          <UInput
            v-model="state.lastName"
            autocomplete="family-name"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="email"
          :label="t('pages.dashboard.settings.general.emailLabel')"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="off"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="avatar"
          :label="t('pages.dashboard.settings.general.avatarLabel')"
        >
          <div class="flex flex-wrap items-center gap-3">
            <UAvatar :src="getAvatarUrl(state.avatar)" :alt="fullName" size="lg" />
            <UButton
              :label="t('common.buttons.choose')"
              color="neutral"
              @click="onFileClick"
            />
            <UButton
              v-if="state.avatar"
              :label="t('pages.dashboard.settings.general.removeAvatar')"
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
      </UForm>
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
        :label="t('common.buttons.saveChanges')"
        color="primary"
        :loading="loading"
        @click="formRef?.submit()"
      />
    </template>
  </UModal>
</template>
