import type { HttpContext } from '@adonisjs/core/http'
import { createOrganizationValidator } from '#validators/organization'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import User from '#models/user'
import Organization from '#models/organization'
import { registerValidator } from '#validators/user'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import fs from 'node:fs/promises'
import OrganizationPolicy from '#policies/organization_policy'
import { randomUUID } from 'node:crypto'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
export default class OrganizationsController {
  private readonly LOGO_DIRECTORY = app.makePath('storage/organizations/logos')

  public async signupWithOrganization({ request, response, i18n }: HttpContext) {
    try {
      const organizationData = JSON.parse(request.input('organization'))
      const logo = request.file('logo')

      const fileName = await this.handleLogoUpload(logo)
      organizationData.logo = fileName

      let organization: Organization
      try {
        const organizationPayload = await createOrganizationValidator.validate(organizationData)
        organization = await Organization.create(organizationPayload)
      } catch (orgError) {
        return response
          .status(422)
          .json({ message: i18n.t('messages.errors.organization_validation_failed'), errors: orgError.messages })
      }

      const userData = JSON.parse(request.input('user'))
      userData.organizationId = organization.id
      userData.onboardingCompleted = false
      userData.verificationToken = randomUUID()

      let user
      try {
        const userPayload = await registerValidator.validate(userData)
        user = await User.create(userPayload)
      } catch (userError) {
        await organization.delete()
        return response.status(422).json({
          message: i18n.t('messages.errors.user_validation_failed'),
          errors: userError.messages,
        })
      }

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
        await organization.delete()
        await user.delete()
        return response.status(422).json({
          message: i18n.t('messages.errors.email_send_failed'),
          errors: errors,
        })
      }

      return response.status(201).json({
        message: i18n.t('messages.organization.created'),
      })
    } catch (error) {
      return this.handleError(response, error, i18n)
    }
  }

  public async getOrganizationWithUsers({ response, auth, bouncer, i18n }: HttpContext) {
    const authUser = auth.user

    if (
      await bouncer.with(OrganizationPolicy).denies('getOrganizationWithUsers' as never, authUser!)
    ) {
      return response.status(403).json({
        message: i18n.t('messages.errors.unauthorized'),
      })
    }

    if (authUser?.organizationId) {
      const organization = await Organization.query()
        .where('id', authUser.organizationId)
        .select('id', 'name', 'logo', 'email')
        .preload('users', (query) => {
          query.where('role', '!=', 3)
          query.select('id', 'fullName', 'email', 'role', 'is_owner')
        })
        .preload('invitations', (query) => {
          query.where('accepted', false)
          query.where('expires_at', '>', DateTime.now().toSQL())
          query.select('id', 'email')
        })
        .firstOrFail()

      if (organization.logo) {
        organization.logo = `organization-logo/${organization.logo}`
      }

      const serializedOrganization = organization.serialize()
      serializedOrganization.users = organization.users.map((user) => ({
        ...user.serialize(),
        isCurrentUser: user.id === authUser.id,
      }))

      return response.json(serializedOrganization)
    }
  }

  public async getOrganizationLogo({ response, params }: HttpContext) {
    const logo = params.logo
    const filePath = join(this.LOGO_DIRECTORY, logo)
    return response.download(filePath)
  }

  public async updateOrganization({ request, response, auth, bouncer, i18n }: HttpContext) {
    const user = auth.user
    if (await bouncer.with(OrganizationPolicy).denies('updateOrganization' as never, user!)) {
      return response.status(403).json({
        message: i18n.t('messages.errors.unauthorized'),
      })
    }

    try {
      const organization = await Organization.findOrFail(user?.organizationId)
      const oldLogo = organization.logo

      const logo = request.file('logo')
      const fileName = await this.handleLogoUpload(logo)

      const updatedData = {
        name: request.input('name', organization.name),
        email: request.input('email', organization.email),
        logo: fileName || oldLogo,
      }

      await organization.merge(updatedData).save()

      if (fileName && oldLogo && oldLogo !== fileName) {
        await this.deleteOldLogo(oldLogo)
      }

      return response.json(updatedData)
    } catch (error) {
      return this.handleError(response, error, i18n)
    }
  }

  private async handleLogoUpload(logo: MultipartFile | null): Promise<string | null> {
    if (logo && logo.tmpPath) {
      const logoHash = await this.getFileHash(logo.tmpPath)
      const existingLogo = await this.findExistingLogo(logoHash)

      if (existingLogo) {
        return existingLogo
      } else {
        const fileName = `${cuid()}.${logo?.extname}`
        await logo?.move(this.LOGO_DIRECTORY, {
          name: fileName,
        })
        return fileName
      }
    }
    return null
  }

  private async getFileHash(input: string | Buffer): Promise<string> {
    const hashSum = createHash('sha256')
    if (typeof input === 'string') {
      const fileBuffer = await readFile(input)
      hashSum.update(fileBuffer)
    } else {
      hashSum.update(input)
    }
    return hashSum.digest('hex')
  }

  private async findExistingLogo(hash: string): Promise<string | null> {
    const files = await fs.readdir(this.LOGO_DIRECTORY)

    for (const file of files) {
      const filePath = join(this.LOGO_DIRECTORY, file)
      const fileHash = await this.getFileHash(filePath)
      if (fileHash === hash) {
        return file
      }
    }

    return null
  }

  private async deleteOldLogo(oldLogo: string): Promise<void> {
    try {
      await fs.unlink(join(this.LOGO_DIRECTORY, oldLogo))
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'ancien logo : ${error.message}`)
    }
  }

  private handleError(response: HttpContext['response'], error: any, i18n: HttpContext['i18n']) {
    console.error(error)
    return response.status(500).json({
      message: i18n.t('messages.errors.server_error'),
      error: error.message,
    })
  }
}
