import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import Audio from '#models/audio'
import AudioConverterService from '#services/audio_converter_service'
import storageService from '#services/storage_service'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeFile, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

export default class MigrateOpusToAac extends BaseCommand {
  static commandName = 'audio:migrate-to-aac'
  static description = 'Convert all Opus audio files to AAC/M4A for universal browser compatibility'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const audios = await Audio.query().where('mimeType', 'audio/opus')

    if (audios.length === 0) {
      this.logger.success('No Opus files found — nothing to migrate.')
      return
    }

    this.logger.info(`Found ${audios.length} Opus file(s) to convert.`)

    const converter = new AudioConverterService()
    let successCount = 0
    let failCount = 0

    for (const audio of audios) {
      const label = `[Audio #${audio.id}] ${audio.fileName}`
      try {
        // 1. Download from storage to temp
        const buffer = await storageService.getFileBuffer(audio.filePath)
        const tempInput = join(tmpdir(), `${randomUUID()}-migrate.opus`)
        await writeFile(tempInput, buffer)

        // 2. Convert to AAC
        const result = await converter.convertToAac(tempInput, 'voice')

        // 3. Upload converted file to storage
        const newName = audio.fileName.replace(/\.[^/.]+$/, '.m4a')
        const stored = await storageService.storeAudioFromPath(
          result.path,
          audio.organizationId,
          { originalName: newName, mimeType: 'audio/mp4' }
        )

        // 4. Keep old path for cleanup
        const oldPath = audio.filePath

        // 5. Update record
        audio.filePath = stored.path
        audio.fileSize = stored.size
        audio.mimeType = 'audio/mp4'
        await audio.save()

        // 6. Delete old Opus from storage
        await storageService.deleteFile(oldPath).catch(() => {})

        // 7. Cleanup temp files
        await unlink(tempInput).catch(() => {})
        await converter.cleanup(result.path)

        successCount++
        this.logger.info(
          `${label} — converted (${(result.originalSize / 1024).toFixed(0)} KB → ${(result.convertedSize / 1024).toFixed(0)} KB)`
        )
      } catch (error) {
        failCount++
        this.logger.error(
          `${label} — FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    this.logger.success(
      `Migration complete: ${successCount} converted, ${failCount} failed out of ${audios.length} total.`
    )
  }
}
