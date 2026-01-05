import vine from '@vinejs/vine'

/**
 * Validator for requesting account deletion
 * orphanOrgsDecisions is optional - required only if user owns organizations
 */
export const requestDeletionValidator = vine.compile(
  vine.object({
    orphanOrgsDecisions: vine
      .array(
        vine.object({
          organizationId: vine.number().positive(),
          action: vine.enum(['transfer', 'delete']),
          newOwnerId: vine.number().positive().optional(),
        })
      )
      .optional(),
    confirmDeletion: vine.accepted(),
  })
)

/**
 * Validator for cancelling a deletion request
 */
export const cancelDeletionValidator = vine.compile(
  vine.object({
    token: vine.string().minLength(32).maxLength(64),
  })
)
