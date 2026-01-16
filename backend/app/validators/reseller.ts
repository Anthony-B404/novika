import vine from '@vinejs/vine'
import Reseller from '#models/reseller'

import User from '#models/user'

/**
 * Validator for creating a reseller
 */
export const createResellerValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(255),
    email: vine
      .string()
      .email()
      .unique(async (_db, value) => {
        const reseller = await Reseller.findBy('email', value)
        if (reseller) return false

        const user = await User.findBy('email', value)
        return !user
      }),
    phone: vine.string().minLength(10).maxLength(20).optional(),
    company: vine.string().minLength(2).maxLength(255),
    siret: vine
      .string()
      .minLength(14)
      .maxLength(14)
      .regex(/^\d{14}$/)
      .optional(),
    address: vine.string().maxLength(500).optional(),
    notes: vine.string().maxLength(2000).optional(),
    initialCredits: vine.number().positive().optional(),
  })
)

/**
 * Validator for updating a reseller (with email uniqueness check excluding current reseller)
 */
export const updateResellerValidator = (resellerId: number) =>
  vine.compile(
    vine.object({
      name: vine.string().minLength(2).maxLength(255).optional(),
      email: vine
        .string()
        .email()
        .unique(async (_db, value) => {
          const reseller = await Reseller.query()
            .where('email', value)
            .whereNot('id', resellerId)
            .first()
          return !reseller
        })
        .optional(),
      phone: vine.string().minLength(10).maxLength(20).nullable().optional(),
      company: vine.string().minLength(2).maxLength(255).optional(),
      siret: vine
        .string()
        .minLength(14)
        .maxLength(14)
        .regex(/^\d{14}$/)
        .nullable()
        .optional(),
      address: vine.string().maxLength(500).nullable().optional(),
      notes: vine.string().maxLength(2000).nullable().optional(),
      isActive: vine.boolean().optional(),
    })
  )

/**
 * Validator for adding credits to a reseller
 */
export const addCreditsValidator = vine.compile(
  vine.object({
    amount: vine.number().positive().min(1),
    description: vine.string().maxLength(500).optional(),
  })
)

/**
 * Validator for removing credits from a reseller
 */
export const removeCreditsValidator = vine.compile(
  vine.object({
    amount: vine.number().positive().min(1),
    description: vine.string().maxLength(500).optional(),
  })
)

/**
 * Validator for listing resellers (query params)
 */
export const listResellersValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    search: vine.string().maxLength(255).optional(),
    isActive: vine
      .string()
      .optional()
      .transform((value) => {
        if (value === 'true') return true
        if (value === 'false') return false
        return undefined
      }),
    sortBy: vine.enum(['name', 'company', 'creditBalance', 'createdAt']).optional(),
    sortOrder: vine.enum(['asc', 'desc']).optional(),
  })
)

/**
 * Validator for listing transactions (query params)
 */
export const listTransactionsValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    type: vine.enum(['purchase', 'distribution', 'adjustment']).optional(),
  })
)
