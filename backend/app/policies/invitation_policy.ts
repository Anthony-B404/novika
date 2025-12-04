import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import User from '#models/user'
import { UserRole } from '#models/user'

export default class InvitationPolicy extends BasePolicy {
  /**
   * Vérifie si l'utilisateur peut créer une invitation
   * - L'utilisateur doit avoir une organisation courante
   * - L'utilisateur doit être Owner (1) ou Administrator (2) de cette organisation
   */
  public async createInvitation(user: User): Promise<AuthorizerResponse> {
    if (!user.currentOrganizationId) {
      return false
    }

    // Charger les organisations de l'utilisateur pour vérifier son rôle
    await user.load('organizations')
    const currentOrg = user.organizations.find((org) => org.id === user.currentOrganizationId)

    if (!currentOrg) {
      return false
    }

    const userRole = currentOrg.$extras.pivot_role

    // Seuls les Owners et Administrators peuvent inviter
    return userRole === UserRole.Owner || userRole === UserRole.Administrator
  }
}
