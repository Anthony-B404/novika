import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

const driveConfig = defineConfig({
  /**
   * The default disk to use for file storage.
   */
  default: env.get('DRIVE_DISK'),

  /**
   * Storage disks configuration.
   */
  services: {
    /**
     * Local filesystem disk.
     * Files are stored in storage/uploads directory.
     * Organization-scoped paths: audios/{organizationId}/, documents/{organizationId}/
     */
    local: services.fs({
      location: app.makePath('storage/uploads'),
      serveFiles: true,
      routeBasePath: '/uploads',
      visibility: 'private',
    }),

    /**
     * S3 disk configuration for production.
     * Uncomment and configure when ready to deploy.
     */
    // s3: services.s3({
    //   credentials: {
    //     accessKeyId: env.get('S3_ACCESS_KEY_ID'),
    //     secretAccessKey: env.get('S3_SECRET_ACCESS_KEY'),
    //   },
    //   region: env.get('S3_REGION'),
    //   bucket: env.get('S3_BUCKET'),
    //   visibility: 'private',
    // }),
  },
})

export default driveConfig

/**
 * Inferring types for the list of disks you have configured
 * in your application.
 */
declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
