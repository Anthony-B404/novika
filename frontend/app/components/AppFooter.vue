<script setup lang="ts">
const { t } = useI18n()

const columns = computed(() => [{
  label: t('footer.resources'),
  children: [{
    label: t('footer.helpCenter')
  }, {
    label: t('footer.docs')
  }, {
    label: t('footer.roadmap')
  }]
}, {
  label: t('footer.company'),
  children: [{
    label: t('footer.about')
  }, {
    label: t('footer.blog')
  }]
}])

const toast = useToast()

const email = ref('')
const loading = ref(false)

function onSubmit() {
  loading.value = true

  toast.add({
    title: t('footer.newsletter.success'),
    description: t('footer.newsletter.successDescription')
  })
}
</script>

<template>
  <USeparator class="h-px" />

  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <form @submit.prevent="onSubmit">
              <UFormField
                name="email"
                :label="$t('footer.newsletter.label')"
                size="lg"
              >
                <UInput
                  v-model="email"
                  type="email"
                  class="w-full"
                  :placeholder="$t('footer.newsletter.placeholder')"
                >
                  <template #trailing>
                    <UButton
                      type="submit"
                      size="xs"
                      color="neutral"
                      variant="link"
                      :loading="loading"
                      :trailing="!loading"
                      trailing-icon="i-lucide-arrow-right"
                    >
                      {{ $t('footer.newsletter.subscribe') }}
                    </UButton>
                  </template>
                </UInput>
              </UFormField>
            </form>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-sm">
        {{ $t('footer.copyright') }} {{ new Date().getFullYear() }}
      </p>
    </template>

    <template #right>
      <UButton
        to="https://github.com"
        target="_blank"
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://twitter.com"
        target="_blank"
        icon="i-simple-icons-x"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
