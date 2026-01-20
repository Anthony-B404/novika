<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useI18n()
const { $localePath } = useNuxtApp()
const { isAuthenticated } = useAuth()
const api = useApi()

// Redirect authenticated users to dashboard
onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo($localePath('dashboard'))
  }
})

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: t('seo.login.title'),
  description: t('seo.login.description')
})

const toast = useToast()

const fields = computed(() => [
  {
    name: 'email',
    type: 'text' as const,
    label: t('auth.login.email'),
    placeholder: t('auth.login.emailPlaceholder'),
    required: true
  }
])

const schema = z.object({
  email: z.preprocess(
    val => val ?? '',
    z.string().superRefine((val, ctx) => {
      if (!val || val.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: t('auth.validation.emailRequired')
        })
      } else if (!z.string().email().safeParse(val).success) {
        ctx.addIssue({
          code: 'custom',
          message: t('auth.validation.invalidEmail')
        })
      }
    })
  )
})

type Schema = z.output<typeof schema>;

async function onSubmit (payload: FormSubmitEvent<Schema>) {
  try {
    await api('/login/request-magic-link', {
      method: 'POST',
      body: { email: payload.data.email }
    })

    toast.add({
      title: t('auth.login.success'),
      description: t('auth.login.successDescription', {
        email: payload.data.email
      }),
      color: 'success'
    })
  } catch (error: unknown) {
    const err = error as { data?: { code?: string; userData?: { email?: string } } }

    // Handle disabled account - show error message to contact administrator
    if (err.data?.code === 'ACCOUNT_DISABLED') {
      toast.add({
        title: t('auth.login.accountDisabled'),
        description: t('auth.login.accountDisabledContactAdmin'),
        color: 'error'
      })
      return
    }

    toast.add({
      title: t('auth.login.error'),
      description: t('auth.login.errorDescription'),
      color: 'error'
    })
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :title="$t('auth.login.title')"
    icon="i-lucide-mail"
    :submit="{ label: $t('auth.login.submitButton') }"
    @submit="onSubmit"
  >
    <template #description>
      {{ $t("auth.login.descriptionNoSignup") }}
    </template>

    <template #footer>
      {{ $t("auth.login.footer") }}
      <ULink :to="$localePath('terms')" class="text-primary font-medium">
        {{
          $t("auth.login.termsOfService")
        }}
      </ULink>.
    </template>
  </UAuthForm>
</template>
