import type { ProcessJobResponse, AudioUploadProgress } from '~/types/audio'
import type { ApiError } from '~/types'

export interface UseAudioUploadOptions {
  onProgress?: (progress: AudioUploadProgress) => void
  onSuccess?: (response: ProcessJobResponse) => void
  onError?: (error: Error) => void
}

/**
 * Check if a file is an audio file by MIME type or extension.
 */
function isAudioFile (file: File): boolean {
  if (file.type.startsWith('audio/')) {
    return true
  }
  const ext = file.name.split('.').pop()?.toLowerCase()
  return !!ext && ALLOWED_AUDIO_EXTENSIONS.has(ext)
}

/**
 * Broad set of audio file extensions — matches backend validator.
 * ffmpeg handles conversion to AAC before transcription/storage.
 */
const ALLOWED_AUDIO_EXTENSIONS = new Set([
  'mp3', 'wav', 'm4a', 'ogg', 'flac', 'opus', 'webm', 'aac', 'wma',
  'aiff', 'aif', 'amr', 'ape', 'caf', 'au', 'ra', 'rm', 'mka',
  'ac3', 'dts', 'mp2', 'mpc', 'oga', 'spx', 'tta', 'voc', 'wv',
  'w64', 'gsm', 'sln', '3gp'
])

const MAX_SIZE = 512 * 1024 * 1024 // 512MB

export function useAudioUpload (options: UseAudioUploadOptions = {}) {
  const { authenticatedFetch } = useAuth()

  const uploading = ref(false)
  const progress = ref<AudioUploadProgress>({ loaded: 0, total: 0, percentage: 0 })
  const error = ref<string | null>(null)

  /**
   * Validate file type and size
   */
  function validateFile (file: File): { valid: boolean; error?: string } {
    if (!isAudioFile(file)) {
      return {
        valid: false,
        error: 'Invalid file type. All audio formats are accepted.'
      }
    }

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 512MB'
      }
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: 'File is empty'
      }
    }

    return { valid: true }
  }

  /**
   * Upload audio file with optional prompt
   */
  async function upload (file: File, prompt?: string): Promise<ProcessJobResponse | null> {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      error.value = validation.error || 'Invalid file'
      options.onError?.(new Error(error.value))
      return null
    }

    // Validate prompt if provided
    if (prompt && prompt.trim().length > 0) {
      if (prompt.trim().length < 5) {
        error.value = 'Prompt must be at least 5 characters'
        options.onError?.(new Error(error.value))
        return null
      }
      if (prompt.trim().length > 5000) {
        error.value = 'Prompt must be less than 5000 characters'
        options.onError?.(new Error(error.value))
        return null
      }
    }

    uploading.value = true
    error.value = null
    progress.value = { loaded: 0, total: file.size, percentage: 0 }

    try {
      const formData = new FormData()
      formData.append('audio', file)
      if (prompt?.trim()) {
        formData.append('prompt', prompt.trim())
      }

      const response = await authenticatedFetch<ProcessJobResponse>('/audio/process', {
        method: 'POST',
        body: formData
      })

      progress.value = { loaded: file.size, total: file.size, percentage: 100 }
      options.onSuccess?.(response)

      return response
    } catch (err: unknown) {
      const apiError = err as ApiError
      error.value = apiError?.data?.message || apiError?.message || 'Upload failed'
      options.onError?.(new Error(error.value ?? undefined))
      return null
    } finally {
      uploading.value = false
    }
  }

  /**
   * Reset state
   */
  function reset () {
    uploading.value = false
    progress.value = { loaded: 0, total: 0, percentage: 0 }
    error.value = null
  }

  /**
   * Format file size for display
   */
  function formatFileSize (bytes: number): string {
    if (bytes < 1024) { return `${bytes} B` }
    if (bytes < 1024 * 1024) { return `${(bytes / 1024).toFixed(1)} KB` }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  /**
   * Format max size for display
   */
  function formatMaxSize (): string {
    return formatFileSize(MAX_SIZE)
  }

  return {
    // State
    uploading: readonly(uploading),
    progress: readonly(progress),
    error: readonly(error),

    // Methods
    validateFile,
    upload,
    reset,
    formatFileSize,
    formatMaxSize,

    // Constants
    MAX_SIZE
  }
}
