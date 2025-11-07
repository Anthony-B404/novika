import User from '#models/user'
import Module from '#models/module'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ModulePolicy extends BasePolicy {
  public async before(user: User | null) {
    if (!user) return false
    if (user.role !== 1) return false
  }

  public async create(user: User, module: Module): Promise<AuthorizerResponse> {
    return module.organizationId === user.organizationId
  }

  public async update(user: User, module: Module): Promise<AuthorizerResponse> {
    return module.organizationId === user.organizationId
  }

  public async delete(user: User, module: Module): Promise<AuthorizerResponse> {
    return module.organizationId === user.organizationId
  }
}
