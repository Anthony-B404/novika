import type { HttpContext } from '@adonisjs/core/http'
import InvitationPolicy from '#policies/invitation_policy'
import Invitation from '#models/invitation'
import Organization from '#models/organization'
import User from '#models/user'
import { registerValidator } from '#validators/user'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import { invitationValidator } from '#validators/invitation'

export default class InvitationsController {
  public async createInvitation({ request, response, auth, bouncer }: HttpContext) {
    const authUser = auth.user

    if (!authUser) {
      return response.status(401).json({
        message: 'Vous devez être connecté pour créer une invitation',
      })
    }

    if (await bouncer.with(InvitationPolicy).denies('createInvitation' as never, authUser!)) {
      return response.status(403).json({
        message: "Vous n'avez pas les permissions pour créer une invitation",
      })
    }

    const { email, role } = request.only(['email', 'role'])

    let payload: any = {
      identifier: randomUUID(),
      email: email,
      organizationId: authUser.organizationId,
      role: role,
      expiresAt: DateTime.now().plus({ days: 7 }).toFormat('yyyy-MM-dd'),
      accepted: false,
    }

    try {
      payload = await invitationValidator.validate(payload)
    } catch (error) {
      return response.status(422).json({
        message: "Erreur de validation de l'invitation",
        errors: error.messages,
      })
    }

    const organization = await Organization.find(authUser.organizationId)

    if (!organization) {
      return response.status(404).json({
        message: "L'organisation n'existe pas",
      })
    }

    try {
      const invitation = await Invitation.create(payload)
      console.log(invitation)
      //   await mail.send((message) => {
      //     message
      //       .to(payload.email)
      //       .from('onboarding@resend.dev')
      //       .subject(`Invitation à rejoindre ${organization.name}`)
      //       .htmlView('emails/invitation', {
      //         identifier: payload.identifier,
      //         organizationName: organization.name,
      //         organizationLogo: organization.logo
      //           ? `http://${process.env.APP_URL}/organization-logo/${organization.logo}`
      //           : 'https://placehold.co/100',
      //       })
      //   })
      return response.status(201).json(invitation)
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la création de l'invitation",
        errors: error.messages,
      })
    }
  }

  public async checkInvitation({ request, response }: HttpContext) {
    const { identifier } = request.params()

    const invitation = await Invitation.findBy('identifier', identifier)

    if (!invitation) {
      return response.status(404).json({
        message: 'Invitation non trouvée',
      })
    }

    if (invitation.accepted) {
      return response.status(400).json({
        message: 'Invitation déjà acceptée',
      })
    }

    const organization = await Organization.find(invitation.organizationId)

    return response.status(200).json({
      organizationName: organization?.name,
      organizationLogo: organization?.logo
        ? `http://${process.env.APP_URL}/organization-logo/${organization.logo}`
        : 'https://placehold.co/100',
    })
  }

  public async acceptInvitation({ request, response }: HttpContext) {
    const { identifier, fullName, password } = request.only(['identifier', 'fullName', 'password'])

    const invitation = await Invitation.findBy('identifier', identifier)

    if (!invitation) {
      return response.status(404).json({
        message: 'Invitation non trouvée',
      })
    }

    const user = await User.findBy('email', invitation.email)

    if (user) {
      return response.status(400).json({
        message: 'Cette email est déjà utilisé',
      })
    }

    const payload = {
      email: invitation.email,
      password: password,
      fullName: fullName,
      role: invitation.role,
      organizationId: invitation.organizationId,
      isOwner: false,
      verificationToken: null,
      emailVerified: true,
    }

    try {
      await registerValidator.validate(payload)
      await User.create(payload)
      invitation.accepted = true
      await invitation.save()
    } catch (error) {
      return response.status(422).json({
        message: "Erreur de validation de l'utilisateur",
        errors: error.messages,
      })
    }

    return response.status(200).json({
      message: 'Invitation acceptée avec succès',
    })
  }

  public async deleteInvitation({ params, response }: HttpContext) {
    const { id } = params

    const invitation = await Invitation.find(id)
    if (!invitation) {
      return response.notFound({ message: 'Invitation not found' })
    }
    try {
      await invitation.delete()
      return response.ok({ message: 'Invitation deleted' })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la suppression de l'invitation",
        errors: error.messages,
      })
    }
  }
}
