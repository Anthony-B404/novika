<script setup lang="ts">
const props = defineProps<{
  file: File | null;
  disabled?: boolean;
}>()

const emit = defineEmits<{
  'file-selected': [file: File];
  'file-removed': [];
}>()

const { t } = useI18n()
const { validateFile: validateAudioFile, formatFileSize } = useAudioUpload()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function validateFile (file: File): boolean {
  return validateAudioFile(file).valid
}

function handleFiles (files: FileList | null) {
  if (!files || files.length === 0 || props.disabled) { return }

  const file = files[0]
  if (file && validateFile(file)) {
    emit('file-selected', file)
  }
}

function handleDrop (event: DragEvent) {
  isDragging.value = false
  if (props.disabled) { return }
  handleFiles(event.dataTransfer?.files || null)
}

function handleDragOver (event: DragEvent) {
  event.preventDefault()
  if (!props.disabled) {
    isDragging.value = true
  }
}

function handleDragLeave () {
  isDragging.value = false
}

function openFilePicker () {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}

function handleInputChange (event: Event) {
  const target = event.target as HTMLInputElement
  handleFiles(target.files)
  // Reset input value to allow selecting the same file again
  target.value = ''
}

function removeFile () {
  emit('file-removed')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Dropzone -->
    <div
      v-if="!file"
      class="relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
      :class="[
        isDragging ? 'border-primary bg-primary/5' : 'border-default hover:border-primary/50',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
      @drop.prevent="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="openFilePicker"
    >
      <input
        ref="fileInput"
        type="file"
        accept="audio/*"
        class="hidden"
        :disabled="disabled"
        @change="handleInputChange"
      >

      <UIcon name="i-lucide-upload-cloud" class="w-12 h-12 mx-auto text-muted mb-4" />

      <p class="text-highlighted font-medium mb-1">
        {{ t("pages.dashboard.analyze.dropzone.title") }}
      </p>
      <p class="text-muted text-sm">
        {{ t("pages.dashboard.analyze.dropzone.description") }}
      </p>
      <p class="text-muted text-xs mt-2">
        {{ t("pages.dashboard.analyze.dropzone.formats") }}
      </p>
    </div>

    <!-- Selected File -->
    <div
      v-else
      class="flex items-center gap-4 p-4 rounded-lg bg-elevated border border-default"
    >
      <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
        <UIcon name="i-lucide-music" class="w-6 h-6 text-primary" />
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-highlighted font-medium truncate">
          {{ file.name }}
        </p>
        <p class="text-muted text-sm">
          {{ formatFileSize(file.size) }}
        </p>
      </div>

      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="sm"
        :disabled="disabled"
        @click="removeFile"
      />
    </div>
  </div>
</template>
