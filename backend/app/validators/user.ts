import vine from '@vinejs/vine'
import { UserRole } from '#models/user'

export const registerValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(8),
    fullName: vine.string(),
    role: vine.enum(
      Object.values(UserRole).filter((value) => typeof value === 'number') as number[]
    ),
    organizationId: vine.number(),
    isOwner: vine.boolean(),
    emailVerified: vine.boolean({ strict: true }),
    verificationToken: vine.string().uuid().optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)
