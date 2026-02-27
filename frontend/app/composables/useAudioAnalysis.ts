import type { Audio } from '~/types/audio'
import type { ApiError } from '~/types'

export function useAudioAnalysis (audioId: Ref<number> | number) {
  const { authenticatedFetch } = useAuth()

  const analyzing = ref(false)
  const error = ref<string | null>(null)

  const resolvedAudioId = computed(() => (typeof audioId === 'number' ? audioId : audioId.value))

  /**
   * Generate or re-generate AI analysis for an audio
   */
  async function generateAnalysis (prompt: string): Promise<{ audio: Audio } | null> {
    analyzing.value = true
    error.value = null

    try {
      const response = await authenticatedFetch<{ message: string; audio: Audio }>(
        `/audios/${resolvedAudioId.value}/analyze`,
        {
          method: 'POST',
          body: { prompt }
        }
      )

      return { audio: response.audio }
    } catch (e: unknown) {
      const apiError = e as ApiError
      error.value = apiError.data?.message || apiError.message || 'Failed to generate analysis'
      return null
    } finally {
      analyzing.value = false
    }
  }

  return {
    analyzing: readonly(analyzing),
    error: readonly(error),
    generateAnalysis
  }
}
