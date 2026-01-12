import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import Organization from '#models/organization'
import User, { UserRole } from '#models/user'
import { CreditTransactionType } from '#models/credit_transaction'
import {
  createResellerOrganizationValidator,
  updateResellerOrganizationValidator,
  listResellerOrganizationsValidator,
  distributeCreditsValidator,
} from '#validators/reseller_api'

export default class ResellerOrganizationsController {
  /**
   * List all organizations belonging to the reseller
   * GET /api/reseller/organizations
   */
  async index({ request, response, reseller, i18n }: HttpContext) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = await request.validateUsing(listResellerOrganizationsValidator)

      const query = Organization.query()
        .where('reseller_id', reseller!.id)
        .withCount('users')

      if (search) {
        query.where((q) => {
          q.whereILike('name', `%${search}%`).orWhereILike('email', `%${search}%`)
        })
      }

      // Convert camelCase sortBy to snake_case
      const sortByColumn = sortBy.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      query.orderBy(sortByColumn, sortOrder)

      const organizations = await query.paginate(page, limit)

      return response.ok(organizations)
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: i18n.t('messages.errors.validation_failed'),
          errors: error.messages,
        })
      }
      throw error
    }
  }

  /**
   * Get a specific organization detail
   * GET /api/reseller/organizations/:id
   */
  async show({ params, response, reseller, i18n }: HttpContext) {
    const organization = await Organization.query()
      .where('id', params.id)
      .preload('users', (query) => {
        query.select(['id', 'email', 'first_name', 'last_name', 'created_at'])
      })
      .withCount('users')
      .first()

    if (!organization) {
      return response.notFound({
        message: i18n.t('messages.organization.not_found'),
      })
    }

    // Policy check: organization must belong to reseller
    if (organization.resellerId !== reseller!.id) {
      return response.forbidden({
        message: i18n.t('messages.reseller_api.organization_access_denied'),
      })
    }

    return response.ok(organization)
  }

  /**
   * Create a new organization with owner user
   * POST /api/reseller/organizations
   *
   * Flow:
   * 1. Create Organization linked to reseller
   * 2. Create Owner User for organization
   * 3. Distribute initial credits from reseller pool (if provided)
   * 4. Send welcome email to owner
   */
  async store({ request, response, auth, reseller, i18n }: HttpContext) {
    try {
      const payload = await request.validateUsing(
        createResellerOrganizationValidator(reseller!.id)
      )
      const resellerAdmin = auth.user!

      // Check if reseller has enough credits for initial distribution
      if (payload.initialCredits && payload.initialCredits > 0) {
        if (!reseller!.hasEnoughCredits(payload.initialCredits)) {
          return response.badRequest({
            code: 'INSUFFICIENT_CREDITS',
            message: i18n.t('messages.reseller_api.insufficient_credits'),
          })
        }
      }

      const result = await db.transaction(async (trx) => {
        // 1. Create organization
        const organization = await Organization.create(
          {
            name: payload.name,
            email: payload.email,
            resellerId: reseller!.id,
            credits: 0,
          },
          { client: trx }
        )

        // 2. Create owner user with magic link
        const magicLinkToken = randomUUID()
        const ownerUser = await User.create(
          {
            email: payload.ownerEmail,
            firstName: payload.ownerFirstName,
            lastName: payload.ownerLastName,
            fullName: `${payload.ownerFirstName} ${payload.ownerLastName}`,
            currentOrganizationId: organization.id,
            magicLinkToken,
            magicLinkExpiresAt: DateTime.now().plus({ days: 7 }),
            onboardingCompleted: false,
            disabled: false,
          },
          { client: trx }
        )

        // 3. Create owner relationship
        await organization.useTransaction(trx).related('users').attach({
          [ownerUser.id]: { role: UserRole.Owner },
        })

        // 4. Distribute initial credits if provided
        if (payload.initialCredits && payload.initialCredits > 0) {
          // Deduct from reseller pool
          reseller!.creditBalance -= payload.initialCredits
          await reseller!.useTransaction(trx).save()

          // Create reseller transaction
          const { default: ResellerTransaction } = await import('#models/reseller_transaction')
          const { ResellerTransactionType } = await import('#models/reseller_transaction')

          await ResellerTransaction.create(
            {
              resellerId: reseller!.id,
              amount: -payload.initialCredits,
              type: ResellerTransactionType.Distribution,
              targetOrganizationId: organization.id,
              description: i18n.t('messages.reseller_api.initial_credits_distribution', {
                organization: organization.name,
              }),
              performedByUserId: resellerAdmin.id,
            },
            { client: trx }
          )

          // Add to organization
          organization.credits = payload.initialCredits
          await organization.useTransaction(trx).save()

          // Create organization credit transaction
          const { default: CreditTransaction } = await import('#models/credit_transaction')
          await CreditTransaction.create(
            {
              userId: resellerAdmin.id,
              organizationId: organization.id,
              amount: payload.initialCredits,
              balanceAfter: payload.initialCredits,
              type: CreditTransactionType.Purchase,
              description: i18n.t('messages.reseller_api.initial_credits_from_reseller'),
            },
            { client: trx }
          )
        }

        return { organization, ownerUser, magicLinkToken }
      })

      // 5. Send welcome email
      const frontendUrl = env.get('FRONTEND_URL', 'http://localhost:3000')
      const apiUrl = env.get('APP_URL', 'http://localhost:3333')

      await mail.send((message) => {
        message
          .to(result.ownerUser.email)
          .from(env.get('MAIL_FROM', 'DH-Echo <contact@dh-echo.cloud>'))
          .subject(
            i18n.t('emails.reseller_org_welcome.subject', {
              organization: result.organization.name,
            })
          )
          .htmlView('emails/reseller_org_welcome', {
            organizationName: result.organization.name,
            ownerName: result.ownerUser.fullName,
            setupUrl: `${frontendUrl}/setup/${result.magicLinkToken}`,
            expiresAt: DateTime.now().plus({ days: 7 }).toFormat('dd/MM/yyyy'),
            initialCredits: payload.initialCredits || 0,
            i18n,
            apiUrl,
          })
      })

      return response.created({
        message: i18n.t('messages.reseller_api.organization_created'),
        organization: result.organization,
      })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: i18n.t('messages.errors.validation_failed'),
          errors: error.messages,
        })
      }
      throw error
    }
  }

  /**
   * Update an organization
   * PUT /api/reseller/organizations/:id
   */
  async update({ params, request, response, reseller, i18n }: HttpContext) {
    const organization = await Organization.find(params.id)

    if (!organization) {
      return response.notFound({
        message: i18n.t('messages.organization.not_found'),
      })
    }

    // Policy check: organization must belong to reseller
    if (organization.resellerId !== reseller!.id) {
      return response.forbidden({
        message: i18n.t('messages.reseller_api.organization_access_denied'),
      })
    }

    try {
      const payload = await request.validateUsing(
        updateResellerOrganizationValidator(reseller!.id, organization.id)
      )

      organization.merge(payload)
      await organization.save()

      return response.ok({
        message: i18n.t('messages.organization.updated'),
        organization,
      })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: i18n.t('messages.errors.validation_failed'),
          errors: error.messages,
        })
      }
      throw error
    }
  }

  /**
   * Distribute credits to an organization
   * POST /api/reseller/organizations/:id/credits
   */
  async distributeCredits({ params, request, response, auth, reseller, i18n }: HttpContext) {
    const organization = await Organization.find(params.id)

    if (!organization) {
      return response.notFound({
        message: i18n.t('messages.organization.not_found'),
      })
    }

    // Policy check: organization must belong to reseller
    if (organization.resellerId !== reseller!.id) {
      return response.forbidden({
        message: i18n.t('messages.reseller_api.organization_access_denied'),
      })
    }

    try {
      const payload = await request.validateUsing(distributeCreditsValidator)
      const resellerAdmin = auth.user!

      // Check reseller has enough credits
      if (!reseller!.hasEnoughCredits(payload.amount)) {
        return response.badRequest({
          code: 'INSUFFICIENT_CREDITS',
          message: i18n.t('messages.reseller_api.insufficient_credits'),
        })
      }

      // Atomic transaction: debit reseller + credit organization
      await db.transaction(async (trx) => {
        // 1. Deduct from reseller pool
        reseller!.creditBalance -= payload.amount
        await reseller!.useTransaction(trx).save()

        // Create reseller transaction
        const { default: ResellerTransaction } = await import('#models/reseller_transaction')
        const { ResellerTransactionType } = await import('#models/reseller_transaction')

        await ResellerTransaction.create(
          {
            resellerId: reseller!.id,
            amount: -payload.amount,
            type: ResellerTransactionType.Distribution,
            targetOrganizationId: organization.id,
            description:
              payload.description ||
              i18n.t('messages.reseller_api.credit_distribution', {
                organization: organization.name,
              }),
            performedByUserId: resellerAdmin.id,
          },
          { client: trx }
        )

        // 2. Add to organization
        organization.credits += payload.amount
        await organization.useTransaction(trx).save()

        // Create organization credit transaction
        const { default: CreditTransaction } = await import('#models/credit_transaction')
        await CreditTransaction.create(
          {
            userId: resellerAdmin.id,
            organizationId: organization.id,
            amount: payload.amount,
            balanceAfter: organization.credits,
            type: CreditTransactionType.Purchase,
            description: i18n.t('messages.reseller_api.credits_from_reseller'),
          },
          { client: trx }
        )
      })

      // Reload to get updated balances
      await reseller!.refresh()
      await organization.refresh()

      return response.ok({
        message: i18n.t('messages.reseller_api.credits_distributed', { amount: payload.amount }),
        resellerBalance: reseller!.creditBalance,
        organizationCredits: organization.credits,
      })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: i18n.t('messages.errors.validation_failed'),
          errors: error.messages,
        })
      }
      throw error
    }
  }
}
