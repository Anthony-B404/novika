import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Reseller from '#models/reseller'
import Organization from '#models/organization'
import ResellerTransaction, { ResellerTransactionType } from '#models/reseller_transaction'
import { DateTime } from 'luxon'

export default class AdminStatsController {
  /**
   * Get global admin statistics.
   *
   * GET /admin/stats
   */
  async index({ response }: HttpContext) {
    // Total resellers
    const totalResellersResult = await Reseller.query().count('* as total')
    const totalResellers = Number(totalResellersResult[0].$extras.total) || 0

    const activeResellersResult = await Reseller.query()
      .where('is_active', true)
      .count('* as total')
    const activeResellers = Number(activeResellersResult[0].$extras.total) || 0

    // Total organizations managed by resellers
    const resellerOrganizationsResult = await Organization.query()
      .whereNotNull('reseller_id')
      .count('* as total')
    const resellerOrganizations = Number(resellerOrganizationsResult[0].$extras.total) || 0

    // Total credits in reseller pools
    const totalCreditsInPoolsResult = await Reseller.query()
      .where('is_active', true)
      .sum('credit_balance as total')
    const totalCreditsInPools = Number(totalCreditsInPoolsResult[0].$extras.total) || 0

    // Get start of current month
    const startOfMonth = DateTime.now().startOf('month').toJSDate()

    // Credits distributed this month (distribution transactions have negative amounts)
    const creditsDistributedThisMonthResult = await ResellerTransaction.query()
      .where('type', ResellerTransactionType.Distribution)
      .where('created_at', '>=', startOfMonth)
      .sum({ total: db.raw('ABS(amount)') })
    const creditsDistributedThisMonth =
      Number(creditsDistributedThisMonthResult[0].$extras.total) || 0

    // Credits purchased this month
    const creditsPurchasedThisMonthResult = await ResellerTransaction.query()
      .where('type', ResellerTransactionType.Purchase)
      .where('created_at', '>=', startOfMonth)
      .sum('amount as total')
    const creditsPurchasedThisMonth = Number(creditsPurchasedThisMonthResult[0].$extras.total) || 0

    // Top resellers by credit balance
    const topResellers = await Reseller.query()
      .where('is_active', true)
      .orderBy('credit_balance', 'desc')
      .limit(5)
      .select(['id', 'name', 'company', 'credit_balance'])

    // Recent transactions
    const recentTransactions = await ResellerTransaction.query()
      .preload('reseller', (q) => q.select(['id', 'name', 'company']))
      .preload('performedBy', (q) => q.select(['id', 'email', 'first_name', 'last_name']))
      .preload('targetOrganization', (q) => q.select(['id', 'name']))
      .orderBy('created_at', 'desc')
      .limit(10)

    return response.ok({
      resellers: {
        total: totalResellers,
        active: activeResellers,
      },
      organizations: {
        managedByResellers: resellerOrganizations,
      },
      credits: {
        totalInPools: totalCreditsInPools,
        distributedThisMonth: creditsDistributedThisMonth,
        purchasedThisMonth: creditsPurchasedThisMonth,
      },
      topResellers,
      recentTransactions,
    })
  }
}
