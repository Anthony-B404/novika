import User from '#models/user'
import Reseller from '#models/reseller'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Policy for Reseller management.
 * Only Super Admins can manage resellers.
 * The middleware already checks for Super Admin status,
 * but policies provide additional authorization granularity.
 */
export default class ResellerPolicy extends BasePolicy {
  /**
   * Check if user can view resellers list
   */
  public viewAny(user: User): AuthorizerResponse {
    return user.isSuperAdmin
  }

  /**
   * Check if user can view a specific reseller
   */
  public view(user: User, _reseller: Reseller): AuthorizerResponse {
    return user.isSuperAdmin
  }

  /**
   * Check if user can create a reseller
   */
  public create(user: User): AuthorizerResponse {
    return user.isSuperAdmin
  }

  /**
   * Check if user can update a reseller
   */
  public update(user: User, _reseller: Reseller): AuthorizerResponse {
    return user.isSuperAdmin
  }

  /**
   * Check if user can delete/deactivate a reseller
   */
  public delete(user: User, _reseller: Reseller): AuthorizerResponse {
    return user.isSuperAdmin
  }

  /**
   * Check if user can manage reseller credits
   */
  public manageCredits(user: User, _reseller: Reseller): AuthorizerResponse {
    return user.isSuperAdmin
  }

  /**
   * Check if user can view global admin stats
   */
  public viewStats(user: User): AuthorizerResponse {
    return user.isSuperAdmin
  }
}
