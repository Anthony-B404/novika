import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import User from '#models/user'
import PromptCategory from '#models/prompt_category'

export default class PromptCategoryPolicy extends BasePolicy {
  /**
   * Check if user can list prompt categories
   *
   * Permission rules:
   * - User must have a current organization set
   */
  public async listCategories(user: User): Promise<AuthorizerResponse> {
    return user.currentOrganizationId !== null
  }

  /**
   * Check if user can create a prompt category
   *
   * Permission rules:
   * - User must have a current organization set
   */
  public async createCategory(user: User): Promise<AuthorizerResponse> {
    return user.currentOrganizationId !== null
  }

  /**
   * Check if user can view a prompt category
   *
   * Permission rules:
   * - Category must belong to user's current organization
   */
  public async viewCategory(user: User, category: PromptCategory): Promise<AuthorizerResponse> {
    return user.currentOrganizationId === category.organizationId
  }

  /**
   * Check if user can update a prompt category
   *
   * Permission rules:
   * - Category must belong to user's current organization
   */
  public async updateCategory(user: User, category: PromptCategory): Promise<AuthorizerResponse> {
    return user.currentOrganizationId === category.organizationId
  }

  /**
   * Check if user can delete a prompt category
   *
   * Permission rules:
   * - Category must belong to user's current organization
   */
  public async deleteCategory(user: User, category: PromptCategory): Promise<AuthorizerResponse> {
    return user.currentOrganizationId === category.organizationId
  }
}
