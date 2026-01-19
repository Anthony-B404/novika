import vine from '@vinejs/vine'
import Organization from '#models/organization'
import User, { UserRole } from '#models/user'

/**
 * Validator for creating an organization via Reseller API
 */
export const createResellerOrganizationValidator = (resellerId: number) =>
  vine.compile(
    vine.object({
      name: vine
        .string()
        .minLength(2)
        .maxLength(255)
        .unique(async (_db, value) => {
          // Check name uniqueness within this reseller's organizations
          const existing = await Organization.query()
            .where('reseller_id', resellerId)
            .whereRaw('LOWER(name) = LOWER(?)', [value])
            .first()
          return !existing
        }),
      email: vine
        .string()
        .trim()
        .email()
        .unique(async (_db, value) => {
          // Check email uniqueness globally
          const existing = await Organization.findBy('email', value)
          return !existing
        }),
      ownerEmail: vine
        .string()
        .trim()
        .email()
        .unique(async (_db, value) => {
          // Owner email must not exist as a user already
          const existingUser = await User.findBy('email', value)
          return !existingUser
        }),
      ownerFirstName: vine.string().minLength(2).maxLength(100),
      ownerLastName: vine.string().minLength(2).maxLength(100),
      initialCredits: vine.number().min(0).optional(),
      // Subscription configuration
      subscriptionEnabled: vine.boolean().optional(),
      monthlyCreditsTarget: vine.number().positive().optional(),
      renewalType: vine.enum(['first_of_month', 'anniversary']).optional(),
      renewalDay: vine.number().min(1).max(28).optional(),
    })
  )

/**
 * Validator for updating an organization via Reseller API
 */
export const updateResellerOrganizationValidator = (resellerId: number, organizationId: number) =>
  vine.compile(
    vine.object({
      name: vine
        .string()
        .minLength(2)
        .maxLength(255)
        .unique(async (_db, value) => {
          // Check name uniqueness excluding current organization
          const existing = await Organization.query()
            .where('reseller_id', resellerId)
            .where('id', '!=', organizationId)
            .whereRaw('LOWER(name) = LOWER(?)', [value])
            .first()
          return !existing
        })
        .optional(),
      email: vine
        .string()
        .trim()
        .email()
        .unique(async (_db, value) => {
          // Check email uniqueness excluding current organization
          const existing = await Organization.query()
            .where('email', value)
            .where('id', '!=', organizationId)
            .first()
          return !existing
        })
        .optional(),
    })
  )

/**
 * Validator for distributing credits to an organization
 */
export const distributeCreditsValidator = vine.compile(
  vine.object({
    amount: vine.number().positive().min(1),
    description: vine.string().maxLength(500).optional(),
  })
)

/**
 * Validator for creating a user in an organization via Reseller API
 * Note: Email uniqueness is checked in controller because we need to handle
 * both new users and existing users being added to the organization
 */
export const createResellerOrgUserValidator = (_organizationId: number) =>
  vine.compile(
    vine.object({
      email: vine.string().trim().email(),
      firstName: vine.string().minLength(2).maxLength(100),
      lastName: vine.string().minLength(2).maxLength(100),
      role: vine.enum([UserRole.Administrator, UserRole.Member]),
    })
  )

/**
 * Validator for listing organizations (query params)
 */
export const listResellerOrganizationsValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    search: vine.string().maxLength(255).optional(),
    sortBy: vine.enum(['name', 'credits', 'createdAt']).optional(),
    sortOrder: vine.enum(['asc', 'desc']).optional(),
  })
)

/**
 * Validator for listing users in an organization (query params)
 */
export const listResellerOrgUsersValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
  })
)

/**
 * Validator for suspending an organization
 */
export const suspendOrganizationValidator = vine.compile(
  vine.object({
    reason: vine.string().maxLength(1000).optional(),
  })
)
