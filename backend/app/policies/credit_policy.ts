import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import User, { UserRole } from '#models/user'

export default class CreditPolicy extends BasePolicy {
  /**
   * Helper to get user's role in the organization
   */
  private async getUserRoleInOrg(user: User, organizationId: number): Promise<number | null> {
    await user.load('organizations')
    const org = user.organizations.find((o) => o.id === organizationId)
    return org?.$extras.pivot_role ?? null
  }

  /**
   * Check if user can view the organization's credit mode
   * All members can view
   */
  public async viewMode(user: User, organizationId: number): Promise<AuthorizerResponse> {
    return user.hasOrganization(organizationId)
  }

  /**
   * Check if user can update the organization's credit mode
   * Only Owner can update
   */
  public async updateMode(user: User, organizationId: number): Promise<AuthorizerResponse> {
    return user.isOwnerOf(organizationId)
  }

  /**
   * Check if user can view member credits list
   * Owner and Administrator can view
   */
  public async viewMemberCredits(user: User, organizationId: number): Promise<AuthorizerResponse> {
    const role = await this.getUserRoleInOrg(user, organizationId)
    if (!role) return false
    return role === UserRole.Owner || role === UserRole.Administrator
  }

  /**
   * Check if user can distribute credits to members
   * Owner and Administrator can distribute
   */
  public async distributeCredits(user: User, organizationId: number): Promise<AuthorizerResponse> {
    const role = await this.getUserRoleInOrg(user, organizationId)
    if (!role) return false
    return role === UserRole.Owner || role === UserRole.Administrator
  }

  /**
   * Check if user can recover credits from members
   * Only Owner can recover
   */
  public async recoverCredits(user: User, organizationId: number): Promise<AuthorizerResponse> {
    return user.isOwnerOf(organizationId)
  }

  /**
   * Check if user can configure auto-refill for members
   * Owner and Administrator can configure
   */
  public async configureAutoRefill(
    user: User,
    organizationId: number
  ): Promise<AuthorizerResponse> {
    const role = await this.getUserRoleInOrg(user, organizationId)
    if (!role) return false
    return role === UserRole.Owner || role === UserRole.Administrator
  }

  /**
   * Check if user can view their own credit balance
   * All members can view their own balance
   */
  public async viewOwnBalance(user: User, organizationId: number): Promise<AuthorizerResponse> {
    return user.hasOrganization(organizationId)
  }

  /**
   * Check if user can view all transaction history (vs just their own)
   * Owner and Administrator can view all, Members can only view their own
   */
  public async viewAllHistory(user: User, organizationId: number): Promise<AuthorizerResponse> {
    const role = await this.getUserRoleInOrg(user, organizationId)
    if (!role) return false
    return role === UserRole.Owner || role === UserRole.Administrator
  }
}
