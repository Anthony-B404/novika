<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useI18n()

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: t('seo.signup.title'),
  description: t('seo.signup.description')
})

const toast = useToast()

const fields = computed(() => [{
  name: 'name',
  type: 'text' as const,
  label: t('auth.signup.name'),
  placeholder: t('auth.signup.namePlaceholder')
}, {
  name: 'email',
  type: 'text' as const,
  label: t('auth.signup.email'),
  placeholder: t('auth.signup.emailPlaceholder')
}, {
  name: 'password',
  label: t('auth.signup.password'),
  type: 'password' as const,
  placeholder: t('auth.signup.passwordPlaceholder')
}])

const providers = computed(() => [{
  label: t('auth.signup.providers.google'),
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: t('auth.signup.providers.google'), description: t('auth.signup.providers.googleDescription') })
  }
}, {
  label: t('auth.signup.providers.github'),
  icon: 'i-simple-icons-github',
  onClick: () => {
    toast.add({ title: t('auth.signup.providers.github'), description: t('auth.signup.providers.githubDescription') })
  }
}])

const schema = z.object({
  name: z.string().min(1, t('auth.validation.nameRequired')),
  email: z.string().email(t('auth.validation.invalidEmail')),
  password: z.string().min(8, t('auth.validation.passwordMin'))
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload)
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    :title="$t('auth.signup.title')"
    :submit="{ label: $t('auth.signup.submit') }"
    @submit="onSubmit"
  >
    <template #description>
      {{ $t('auth.signup.description') }} <ULink
        to="/login"
        class="font-medium"
      >
        {{ $t('auth.signup.loginLink') }}
      </ULink>.
    </template>
  </UAuthForm>
</template>
