import User from '#models/user'
import Class from '#models/class'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ClassPolicy extends BasePolicy {
  public async before(user: User | null) {
    if (!user) return false
  }

  public async create(user: User): Promise<AuthorizerResponse> {
    return user.role === 1
  }

  public async update(user: User, classItem: Class): Promise<AuthorizerResponse> {
    return user.role === 1 && user.organizationId === classItem.organizationId
  }

  public async delete(user: User, classItem: Class): Promise<AuthorizerResponse> {
    return user.role === 1 && user.organizationId === classItem.organizationId
  }

  public async view(user: User, classItem: Class): Promise<AuthorizerResponse> {
    return user.organizationId === classItem.organizationId
  }
}
