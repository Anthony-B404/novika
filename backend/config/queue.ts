import env from '#start/env'

/**
 * Queue configuration for BullMQ with Redis backend.
 * Used for async audio transcription processing.
 */

export interface QueueConfig {
  connection: {
    host: string
    port: number
    password?: string
  }
  defaultJobOptions: {
    attempts: number
    backoff: {
      type: 'exponential' | 'fixed'
      delay: number
    }
    removeOnComplete: boolean
    removeOnFail: boolean
  }
  queues: {
    transcription: {
      name: string
      concurrency: number
    }
  }
}

const queueConfig: QueueConfig = {
  /**
   * Redis connection configuration.
   */
  connection: {
    host: env.get('REDIS_HOST'),
    port: env.get('REDIS_PORT'),
    password: env.get('REDIS_PASSWORD'),
  },

  /**
   * Default options for all jobs.
   */
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5 seconds initial delay
    },
    removeOnComplete: false, // Keep for status tracking
    removeOnFail: false, // Keep for debugging
  },

  /**
   * Queue definitions.
   */
  queues: {
    transcription: {
      name: 'audio-transcription',
      concurrency: 2, // Process 2 jobs simultaneously
    },
  },
}

export default queueConfig
