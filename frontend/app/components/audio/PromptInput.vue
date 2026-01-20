<script setup lang="ts">
import type { Prompt } from '~/types/prompt'
import PromptQuickSelect from '~/components/prompt/PromptQuickSelect.vue'

const model = defineModel<string>({ default: '' })

defineProps<{
  disabled?: boolean;
}>()

const { t } = useI18n()

const promptsStore = usePromptsStore()
const quickSelectOpen = ref(false)

// Load prompts on mount
onMounted(async () => {
  if (promptsStore.prompts.length === 0) {
    await promptsStore.fetchPrompts()
  }
})

// Get favorite prompts for quick access (limit to 4)
const favoritePrompts = computed(() => {
  return promptsStore.favoritePrompts.slice(0, 4)
})

// Get recent prompts as fallback when no favorites (limit to 4)
const recentPrompts = computed(() => {
  return promptsStore.prompts.slice(0, 4)
})

// Display prompts: favorites first, then recent as fallback
const displayPrompts = computed(() => {
  if (favoritePrompts.value.length > 0) {
    return { prompts: favoritePrompts.value, isFavorites: true }
  }
  return { prompts: recentPrompts.value, isFavorites: false }
})

function usePrompt (prompt: Prompt) {
  model.value = prompt.content
  // Track usage
  promptsStore.incrementUsage(prompt.id)
}

function handleSelectFromLibrary (prompt: Prompt) {
  model.value = prompt.content
  promptsStore.incrementUsage(prompt.id)
}
</script>

<template>
  <div class="space-y-4">
    <UTextarea
      v-model="model"
      :placeholder="t('pages.dashboard.analyze.promptPlaceholder')"
      :disabled="disabled"
      :rows="5"
      autoresize
      class="w-full"
    />

    <!-- Prompt suggestions -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <p class="text-xs text-muted font-medium">
          {{ t("pages.dashboard.analyze.suggestionsTitle") }}
        </p>
        <UButton
          icon="i-lucide-bookmark"
          size="xs"
          variant="ghost"
          color="primary"
          :disabled="disabled"
          @click="quickSelectOpen = true"
        >
          {{ t('pages.dashboard.prompts.library') }}
        </UButton>
      </div>

      <div class="flex flex-wrap gap-2">
        <!-- Prompts from library (favorites or recent) -->
        <template v-if="displayPrompts.prompts.length > 0">
          <UButton
            v-for="prompt in displayPrompts.prompts"
            :key="prompt.id"
            :label="prompt.title"
            size="xs"
            variant="soft"
            color="primary"
            :disabled="disabled"
            @click="usePrompt(prompt)"
          >
            <template v-if="displayPrompts.isFavorites" #leading>
              <UIcon name="i-lucide-star" class="h-3 w-3 text-yellow-400" />
            </template>
          </UButton>
        </template>

        <!-- Empty state -->
        <template v-else>
          <p class="text-xs text-gray-400">
            {{ t('pages.dashboard.prompts.noPrompts') }}
          </p>
        </template>
      </div>
    </div>

    <!-- Quick select modal -->
    <PromptQuickSelect
      v-model:open="quickSelectOpen"
      @select="handleSelectFromLibrary"
    />
  </div>
</template>
