import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import User from '#models/user'
import Organization from '#models/organization'

export default class InvitationPolicy extends BasePolicy {
  public async createInvitation(user: User): Promise<AuthorizerResponse> {
    const organization = await Organization.find(user.organizationId)
    return user?.role === 1 && organization !== null
  }
}
