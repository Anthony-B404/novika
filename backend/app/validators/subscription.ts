import vine from '@vinejs/vine'

/**
 * Validator for configuring a subscription on an organization
 */
export const configureSubscriptionValidator = vine.compile(
  vine.object({
    enabled: vine.boolean(),
    monthlyCreditsTarget: vine.number().positive().min(1).nullable().optional(),
    renewalType: vine.enum(['first_of_month', 'anniversary']).nullable().optional(),
    renewalDay: vine.number().min(1).max(28).nullable().optional(),
  })
)

/**
 * Validator for listing upcoming renewals (query params)
 */
export const listUpcomingRenewalsValidator = vine.compile(
  vine.object({
    days: vine.number().min(1).max(365).optional(),
  })
)
