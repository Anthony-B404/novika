import User from '#models/user'
import Organization from '#models/organization'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class OrganizationPolicy extends BasePolicy {
  public async getOrganizationWithUsers(user: User): Promise<AuthorizerResponse> {
    const organization = await Organization.find(user.organizationId)
    return user?.role === 1 && organization !== null
  }

  public async updateOrganization(user: User): Promise<AuthorizerResponse> {
    const organization = await Organization.find(user.organizationId)
    return user?.role === 1 && organization !== null
  }
}
