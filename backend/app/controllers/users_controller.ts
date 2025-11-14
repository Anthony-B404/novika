import type { HttpContext } from '@adonisjs/core/http'
import User, { UserRole } from '#models/user'
import { registerValidator } from '#validators/user'
import mail from '@adonisjs/mail/services/main'
import { randomUUID } from 'node:crypto'
import Invitation from '#models/invitation'

export default class AuthController {
  public async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const user = await User.create(payload)
    return response.created(user)
  }

  public async login({ request, response, i18n }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)
      return response.ok({ user, token })
    } catch {
      return response.unauthorized({ message: i18n.t('messages.auth.invalid_credentials') })
    }
  }

  public async logout({ auth, response, i18n }: HttpContext) {
    const token = auth.user!.currentAccessToken
    await User.accessTokens.delete(auth.user!, token.identifier)
    return response.ok({ message: i18n.t('messages.auth.logout_success') })
  }

  public async me({ auth, response }: HttpContext) {
    const user = auth.user
    return response.ok(user)
  }

  public async checkToken({ response, i18n }: HttpContext) {
    return response.ok({ message: i18n.t('messages.auth.token_valid') })
  }

  public async verifyEmail({ params, response, i18n }: HttpContext) {
    const { token } = params
    const user = await User.findBy('verification_token', token)
    if (!user) {
      return response.notFound({ message: i18n.t('messages.user.not_found') })
    }
    user.verificationToken = null
    user.emailVerified = true
    await user.save()
    return response.ok({ user })
  }

  public async resendVerification({ auth, response, i18n }: HttpContext) {
    const user = await User.findBy('id', auth.user!.id)
    if (!user) {
      return response.notFound({ message: i18n.t('messages.user.not_found') })
    }

    user.verificationToken = randomUUID()
    await user.save()

    try {
      await mail.send((message) => {
        message
          .to(user.email)
          .from('onboarding@resend.dev')
          .subject(i18n.t('emails.verification.subject'))
          .htmlView('emails/verify_email', {
            token: user.verificationToken,
            i18n: i18n,
          })
      })
    } catch (errors) {
      return response.status(422).json({
        message: i18n.t('messages.errors.email_send_failed'),
        errors: errors,
      })
    }

    return response.ok({ message: i18n.t('messages.auth.verification_sent') })
  }

  public async checkEmailVerification({ auth, response }: HttpContext) {
    const user = await User.findBy('id', auth.user!.id)
    return response.ok({ emailVerified: user?.emailVerified })
  }

  public async deleteMember({ params, response, i18n }: HttpContext) {
    const { id } = params

    const user = await User.find(id)
    if (!user) {
      return response.notFound({ message: i18n.t('messages.user.not_found') })
    }
    try {
      await user.delete()
      return response.ok({ message: i18n.t('messages.user.deleted') })
    } catch (error) {
      return response.status(500).json({
        message: i18n.t('messages.errors.user_delete_failed'),
        errors: error.messages,
      })
    }
  }

}
