import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { unlink, stat, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import app from '@adonisjs/core/services/app'
import env from '#start/env'

// Use createRequire to import CommonJS modules in ESM
const require = createRequire(import.meta.url)

/**
 * Get ffmpeg path - prefer environment variable (for Docker), fallback to static package (for local dev)
 */
function getFfmpegPath(): string {
  const envPath = env.get('FFMPEG_PATH')
  if (envPath) {
    return envPath
  }
  return require('ffmpeg-static') as string
}

/**
 * Get ffprobe path - prefer environment variable (for Docker), fallback to static package (for local dev)
 */
function getFfprobePath(): string {
  const envPath = env.get('FFPROBE_PATH')
  if (envPath) {
    return envPath
  }
  const ffprobeStatic = require('ffprobe-static') as { path: string }
  return ffprobeStatic.path
}

const ffmpegPath = getFfmpegPath()
const ffprobePath = getFfprobePath()

const execFileAsync = promisify(execFile)

/**
 * Audio conversion result
 */
export interface ConversionResult {
  path: string
  originalSize: number
  convertedSize: number
  duration: number
  compressionRatio: number
}

/**
 * Opus encoding presets for different use cases
 */
export const OPUS_PRESETS = {
  /** Voice/speech - excellent quality at low bitrate */
  voice: {
    bitrate: '48k',
    channels: 1,
    sampleRate: 48000,
  },
  /** Voice with higher quality */
  voiceHq: {
    bitrate: '64k',
    channels: 1,
    sampleRate: 48000,
  },
  /** Music/podcast quality */
  music: {
    bitrate: '96k',
    channels: 2,
    sampleRate: 48000,
  },
} as const

export type OpusPreset = keyof typeof OPUS_PRESETS

/**
 * AAC encoding presets — universally supported (Safari, iOS, Chrome, Firefox)
 */
export const AAC_PRESETS = {
  /** Voice/speech — good quality, small files */
  voice: {
    bitrate: '64k',
    channels: 1,
    sampleRate: 44100,
  },
  /** Voice with higher quality */
  voiceHq: {
    bitrate: '96k',
    channels: 1,
    sampleRate: 44100,
  },
  /** Music/podcast quality */
  music: {
    bitrate: '128k',
    channels: 2,
    sampleRate: 44100,
  },
} as const

export type AacPreset = keyof typeof AAC_PRESETS

/**
 * Service for converting audio files to Opus format.
 * Uses ffmpeg-static for portable ffmpeg binary.
 */
export default class AudioConverterService {
  /**
   * Check if ffmpeg is available
   */
  async checkFfmpegAvailable(): Promise<boolean> {
    try {
      if (!ffmpegPath) {
        return false
      }
      await execFileAsync(ffmpegPath, ['-version'])
      return true
    } catch {
      return false
    }
  }

  /**
   * Get audio duration in seconds using ffprobe
   */
  async getDuration(filePath: string): Promise<number> {
    const args = ['-v', 'quiet', '-print_format', 'json', '-show_format', filePath]

    const { stdout } = await execFileAsync(ffprobePath, args)
    const data = JSON.parse(stdout)

    return Number.parseFloat(data.format?.duration) || 0
  }

  /**
   * Get file size in bytes
   */
  async getFileSize(filePath: string): Promise<number> {
    const stats = await stat(filePath)
    return stats.size
  }

  /**
   * Convert audio file to Opus format
   *
   * @param inputPath - Path to source audio file
   * @param preset - Opus encoding preset (default: 'voice')
   * @returns Conversion result with paths and size info
   */
  async convertToOpus(inputPath: string, preset: OpusPreset = 'voice'): Promise<ConversionResult> {
    if (!ffmpegPath) {
      throw new Error('ffmpeg-static path not found')
    }

    const settings = OPUS_PRESETS[preset]
    const tmpDir = app.tmpPath()
    await mkdir(tmpDir, { recursive: true })
    const outputPath = join(tmpDir, `${randomUUID()}.opus`)

    // Get original file info
    const [originalSize, duration] = await Promise.all([
      this.getFileSize(inputPath),
      this.getDuration(inputPath),
    ])

    // Build ffmpeg arguments for Opus conversion
    const args = [
      '-i',
      inputPath,
      '-acodec',
      'libopus',
      '-b:a',
      settings.bitrate,
      '-ac',
      settings.channels.toString(),
      '-ar',
      settings.sampleRate.toString(),
      '-vn', // No video
      '-y', // Overwrite output
      outputPath,
    ]

    await execFileAsync(ffmpegPath, args)

    // Get converted file size
    const convertedSize = await this.getFileSize(outputPath)
    const compressionRatio = originalSize > 0 ? convertedSize / originalSize : 1

    return {
      path: outputPath,
      originalSize,
      convertedSize,
      duration,
      compressionRatio,
    }
  }

  /**
   * Convert audio file to AAC/M4A format (universally supported by all browsers)
   *
   * @param inputPath - Path to source audio file
   * @param preset - AAC encoding preset (default: 'voice')
   * @returns Conversion result with paths and size info
   */
  async convertToAac(inputPath: string, preset: AacPreset = 'voice'): Promise<ConversionResult> {
    if (!ffmpegPath) {
      throw new Error('ffmpeg-static path not found')
    }

    const settings = AAC_PRESETS[preset]
    const tmpDir = app.tmpPath()
    await mkdir(tmpDir, { recursive: true })
    const outputPath = join(tmpDir, `${randomUUID()}.m4a`)

    // Get original file info
    const [originalSize, duration] = await Promise.all([
      this.getFileSize(inputPath),
      this.getDuration(inputPath),
    ])

    // Build ffmpeg arguments for AAC conversion
    const args = [
      '-i',
      inputPath,
      '-acodec',
      'aac',
      '-b:a',
      settings.bitrate,
      '-ac',
      settings.channels.toString(),
      '-ar',
      settings.sampleRate.toString(),
      '-vn', // No video
      '-y', // Overwrite output
      outputPath,
    ]

    await execFileAsync(ffmpegPath, args)

    // Get converted file size
    const convertedSize = await this.getFileSize(outputPath)
    const compressionRatio = originalSize > 0 ? convertedSize / originalSize : 1

    return {
      path: outputPath,
      originalSize,
      convertedSize,
      duration,
      compressionRatio,
    }
  }

  /**
   * Convert audio and delete original file
   *
   * @param inputPath - Path to source audio file
   * @param preset - Opus encoding preset (default: 'voice')
   * @returns Conversion result
   */
  async convertAndReplace(
    inputPath: string,
    preset: OpusPreset = 'voice'
  ): Promise<ConversionResult> {
    const result = await this.convertToOpus(inputPath, preset)

    // Delete original file
    try {
      await unlink(inputPath)
    } catch {
      // Ignore errors during cleanup
    }

    return result
  }

  /**
   * Speed up audio file for transcription cost optimization.
   * Uses ffmpeg atempo filter. Output is a lightweight AAC file.
   *
   * @param inputPath - Path to source audio file
   * @param factor - Speed multiplier (e.g. 1.75)
   * @returns Path to sped-up temp file
   */
  async speedUp(inputPath: string, factor: number): Promise<string> {
    if (!ffmpegPath) {
      throw new Error('ffmpeg-static path not found')
    }

    const tmpDir = app.tmpPath()
    await mkdir(tmpDir, { recursive: true })
    const outputPath = join(tmpDir, `${randomUUID()}-speedup.m4a`)

    const args = [
      '-i',
      inputPath,
      '-filter:a',
      `atempo=${factor}`,
      '-acodec',
      'aac',
      '-b:a',
      '64k',
      '-ac',
      '1',
      '-vn',
      '-y',
      outputPath,
    ]

    await execFileAsync(ffmpegPath, args, { maxBuffer: 10 * 1024 * 1024 })

    return outputPath
  }

  /**
   * Check if file is already in Opus format
   */
  isOpusFile(filePath: string): boolean {
    return filePath.toLowerCase().endsWith('.opus')
  }

  /**
   * Cleanup temporary converted file
   */
  async cleanup(filePath: string): Promise<void> {
    try {
      await unlink(filePath)
    } catch {
      // Ignore errors during cleanup
    }
  }
}
