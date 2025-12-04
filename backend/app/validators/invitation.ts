import vine from '@vinejs/vine'
import Invitation from '#models/invitation'
import User from '#models/user'
import { UserRole } from '#models/user'

/**
 * Validator pour la création d'une invitation
 * Vérifie que l'email n'existe pas déjà comme membre ou invitation existante dans CETTE organisation
 * Vérifie que le role est Administrator (2) ou Member (3) uniquement
 */
export const createInvitationValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .unique(async (db, value, field) => {
        // Récupérer organizationId depuis les meta
        const organizationId = field.meta.organizationId

        // 1. Vérifier si l'email existe comme user membre de CETTE organisation
        const user = await User.findBy('email', value)
        if (user) {
          const isMember = await user.hasOrganization(organizationId)
          if (isMember) {
            return false // User déjà membre de cette organisation
          }
        }

        // 2. Vérifier qu'il n'y a pas d'invitation existante pour CETTE organisation
        const invitation = await Invitation.query()
          .where('email', value)
          .where('organizationId', organizationId)
          .first()

        return !invitation // false si invitation existe pour cette organisation
      }),
    role: vine.enum([UserRole.Administrator, UserRole.Member]),
  })
)

/**
 * Validator pour l'acceptation d'une invitation
 * firstName et lastName sont optionnels pour les utilisateurs existants
 * Obligatoires uniquement pour les nouveaux utilisateurs (vérification dans le controller)
 */
export const acceptInvitationValidator = vine.compile(
  vine.object({
    identifier: vine.string().uuid(),
    firstName: vine.string().minLength(2).optional(),
    lastName: vine.string().minLength(2).optional(),
  })
)
