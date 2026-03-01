import vine from '@vinejs/vine'

/**
 * Validator for audio processing request
 */
export const audioProcessValidator = vine.compile(
  vine.object({
    prompt: vine.string().minLength(5).maxLength(5000).optional(),
  })
)

/**
 * Validator for audio analysis request (generate/re-generate analysis on existing audio)
 */
export const audioAnalyzeValidator = vine.compile(
  vine.object({
    prompt: vine.string().minLength(5).maxLength(5000),
  })
)

/**
 * Check if a MIME type is an audio type.
 * Accepts any type starting with "audio/".
 */
export function isAudioMimeType(type: string): boolean {
  return type.startsWith('audio/')
}

/**
 * Allowed audio file extensions — broad list covering all common formats.
 * ffmpeg handles conversion to AAC before transcription/storage.
 */
export const ALLOWED_AUDIO_EXTENSIONS = [
  'mp3',
  'wav',
  'm4a',
  'mp4',
  'ogg',
  'flac',
  'opus',
  'webm',
  'aac',
  'wma',
  'aiff',
  'aif',
  'amr',
  'ape',
  'caf',
  'au',
  'ra',
  'rm',
  'mka',
  'ac3',
  'dts',
  'mp2',
  'mpc',
  'oga',
  'spx',
  'tta',
  'voc',
  'wv',
  'w64',
  'gsm',
  'sln',
  '3gp',
]

/**
 * Maximum file size in bytes (512MB)
 */
export const MAX_AUDIO_SIZE = 512 * 1024 * 1024

/**
 * Validator for audio list (index) request with pagination and filters
 */
export const audioIndexValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    status: vine.enum(['pending', 'processing', 'completed', 'failed']).optional(),
    search: vine.string().maxLength(255).optional(),
    sort: vine.enum(['createdAt', 'title', 'duration', 'status']).optional(),
    order: vine.enum(['asc', 'desc']).optional(),
  })
)

/**
 * Validator for batch delete request
 */
export const audioBatchDeleteValidator = vine.compile(
  vine.object({
    ids: vine.array(vine.number().positive()).minLength(1).maxLength(50),
  })
)

/**
 * Validator for audio update request
 */
export const audioUpdateValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
  })
)

/**
 * Validator for audio chat request (multi-turn conversation with transcript)
 */
export const audioChatValidator = vine.compile(
  vine.object({
    messages: vine
      .array(
        vine.object({
          role: vine.enum(['user', 'assistant']),
          content: vine.string().minLength(1).maxLength(5000),
        })
      )
      .minLength(1)
      .maxLength(50),
  })
)

/**
 * Export format options
 */
export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'md'

/**
 * Export content options
 */
export type ExportContent = 'transcription' | 'analysis' | 'both'

/**
 * Validator for audio export request
 */
export const audioExportValidator = vine.compile(
  vine.object({
    format: vine.enum(['pdf', 'docx', 'txt', 'md'] as const),
    content: vine.enum(['transcription', 'analysis', 'both'] as const),
  })
)
