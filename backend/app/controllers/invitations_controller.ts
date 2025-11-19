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
  public async createInvitation({ request, response, auth, bouncer, i18n }: HttpContext) {
    const authUser = auth.user

    if (!authUser) {
      return response.status(401).json({
        message: i18n.t('messages.auth.unauthorized'),
      })
    }

    if (await bouncer.with(InvitationPolicy).denies('createInvitation' as never, authUser!)) {
      return response.status(403).json({
        message: i18n.t('messages.errors.unauthorized'),
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
        message: i18n.t('messages.errors.invitation_validation_failed'),
        errors: error.messages,
      })
    }

    const organization = await Organization.find(authUser.organizationId)

    if (!organization) {
      return response.status(404).json({
        message: i18n.t('messages.organization.not_found'),
      })
    }

    try {
      const invitation = await Invitation.create(payload)

      await mail.send((message) => {
        message
          .to(payload.email)
          .from('onboarding@resend.dev')
          .subject(i18n.t('emails.invitation.subject', { organization: organization.name }))
          .htmlView('emails/invitation', {
            identifier: payload.identifier,
            organizationName: organization.name,
            organizationLogo: organization.logo
              ? `http://${process.env.APP_URL}/organization-logo/${organization.logo}`
              : 'https://placehold.co/100',
            i18n: i18n,
          })
      })

      return response.status(201).json(invitation)
    } catch (error) {
      return response.status(500).json({
        message: i18n.t('messages.errors.invitation_create_failed'),
        errors: error.messages,
      })
    }
  }

  public async checkInvitation({ request, response, i18n }: HttpContext) {
    const { identifier } = request.params()

    const invitation = await Invitation.findBy('identifier', identifier)

    if (!invitation) {
      return response.status(404).json({
        message: i18n.t('messages.invitation.invalid'),
      })
    }

    if (invitation.accepted) {
      return response.status(400).json({
        message: i18n.t('messages.invitation.already_accepted'),
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

  public async acceptInvitation({ request, response, i18n }: HttpContext) {
    const { identifier, fullName, password } = request.only(['identifier', 'fullName', 'password'])

    const invitation = await Invitation.findBy('identifier', identifier)

    if (!invitation) {
      return response.status(404).json({
        message: i18n.t('messages.invitation.invalid'),
      })
    }

    const user = await User.findBy('email', invitation.email)

    if (user) {
      return response.status(400).json({
        message: i18n.t('messages.errors.email_already_used'),
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
      onboardingCompleted: true,
    }

    try {
      await registerValidator.validate(payload)
      await User.create(payload)
      invitation.accepted = true
      await invitation.save()
    } catch (error) {
      return response.status(422).json({
        message: i18n.t('messages.errors.user_validation_failed'),
        errors: error.messages,
      })
    }

    return response.status(200).json({
      message: i18n.t('messages.invitation.accepted'),
    })
  }

  public async deleteInvitation({ params, response, i18n }: HttpContext) {
    const { id } = params

    const invitation = await Invitation.find(id)
    if (!invitation) {
      return response.notFound({ message: i18n.t('messages.invitation.invalid') })
    }
    try {
      await invitation.delete()
      return response.ok({ message: i18n.t('messages.invitation.deleted') })
    } catch (error) {
      return response.status(500).json({
        message: i18n.t('messages.errors.invitation_delete_failed'),
        errors: error.messages,
      })
    }
  }
}
