import vine from '@vinejs/vine'
import Invitation from '#models/invitation'
import User from '#models/user'
import { DateTime } from 'luxon'
export const invitationValidator = vine.compile(
  vine.object({
    identifier: vine.string().uuid(),
    email: vine
      .string()
      .email()
      .unique(async (_, value) => {
        const user = await User.findBy('email', value)
        const invitation = await Invitation.findBy('email', value)
        return !user && !invitation
      }),
    organizationId: vine.number(),
    role: vine.number(),
    expiresAt: vine.date().equals(DateTime.now().plus({ days: 7 }).toFormat('yyyy-MM-dd')),
    accepted: vine.boolean(),
  })
)
