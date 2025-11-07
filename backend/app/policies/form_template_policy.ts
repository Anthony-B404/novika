import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import User from '#models/user'
import FormTemplate from '#models/form_template'

export default class FormTemplatePolicy extends BasePolicy {
  public async before(user: User | null) {
    if (!user) return false
  }

  public async view(user: User, formTemplate: FormTemplate): Promise<AuthorizerResponse> {
    return user.organizationId === formTemplate.organizationId
  }

  public async create(user: User): Promise<AuthorizerResponse> {
    return user.role === 1
  }

  public async update(user: User, formTemplate: FormTemplate): Promise<AuthorizerResponse> {
    return user.role === 1 && user.organizationId === formTemplate.organizationId
  }

  public async delete(user: User, formTemplate: FormTemplate): Promise<AuthorizerResponse> {
    return user.role === 1 && user.organizationId === formTemplate.organizationId
  }

  public async rename(user: User, formTemplate: FormTemplate): Promise<AuthorizerResponse> {
    return user.role === 1 && user.organizationId === formTemplate.organizationId
  }
}
