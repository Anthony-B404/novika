import User from '#models/user'
import Organization from '#models/organization'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Policy for Reseller API organization management.
 * Reseller admins can only manage organizations linked to their reseller account.
 */
export default class ResellerOrganizationPolicy extends BasePolicy {
  /**
   * Check if reseller admin can view organization
   * - Organization must belong to reseller's account
   */
  public view(user: User, organization: Organization): AuthorizerResponse {
    return this.belongsToReseller(user, organization)
  }

  /**
   * Check if reseller admin can update organization
   */
  public update(user: User, organization: Organization): AuthorizerResponse {
    return this.belongsToReseller(user, organization)
  }

  /**
   * Check if reseller admin can distribute credits to organization
   */
  public distributeCredits(user: User, organization: Organization): AuthorizerResponse {
    return this.belongsToReseller(user, organization)
  }

  /**
   * Check if reseller admin can manage users in organization
   */
  public manageUsers(user: User, organization: Organization): AuthorizerResponse {
    return this.belongsToReseller(user, organization)
  }

  /**
   * Helper: Check if organization belongs to user's reseller account
   */
  private belongsToReseller(user: User, organization: Organization): boolean {
    if (!user.resellerId) return false
    return organization.resellerId === user.resellerId
  }
}
