import vine from '@vinejs/vine'

/**
 * Validator for updating organization credit mode
 */
export const updateCreditModeValidator = vine.compile(
  vine.object({
    mode: vine.enum(['shared', 'individual']),
  })
)

/**
 * Validator for distributing credits to a user
 */
export const distributeCreditValidator = vine.compile(
  vine.object({
    userId: vine.number().positive(),
    amount: vine.number().positive().max(100000),
    description: vine.string().maxLength(255).optional(),
  })
)

/**
 * Validator for recovering credits from a user
 */
export const recoverCreditValidator = vine.compile(
  vine.object({
    userId: vine.number().positive(),
    amount: vine.number().positive(),
    description: vine.string().maxLength(255).optional(),
  })
)

/**
 * Validator for configuring auto-refill
 */
export const configureAutoRefillValidator = vine.compile(
  vine.object({
    enabled: vine.boolean(),
    amount: vine.number().positive().optional().requiredWhen('enabled', '=', true),
    day: vine.number().min(1).max(28).optional().requiredWhen('enabled', '=', true),
  })
)

/**
 * Validator for setting credit cap
 */
export const setCreditCapValidator = vine.compile(
  vine.object({
    cap: vine.number().positive().nullable(),
  })
)

/**
 * Validator for credit history query params
 */
export const creditHistoryQueryValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    type: vine.string().optional(),
  })
)

/**
 * Validator for configuring global auto-refill settings at organization level
 */
export const configureGlobalAutoRefillValidator = vine.compile(
  vine.object({
    enabled: vine.boolean(),
    defaultAmount: vine.number().positive().optional().requiredWhen('enabled', '=', true),
    defaultDay: vine.number().min(1).max(28).optional().requiredWhen('enabled', '=', true),
  })
)
