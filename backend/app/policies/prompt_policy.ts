import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import User from '#models/user'
import Prompt from '#models/prompt'

export default class PromptPolicy extends BasePolicy {
  /**
   * Check if user can list prompts
   *
   * Permission rules:
   * - User must have a current organization set
   */
  public async listPrompts(user: User): Promise<AuthorizerResponse> {
    return user.currentOrganizationId !== null
  }

  /**
   * Check if user can create a prompt
   *
   * Permission rules:
   * - User must have a current organization set
   */
  public async createPrompt(user: User): Promise<AuthorizerResponse> {
    return user.currentOrganizationId !== null
  }

  /**
   * Check if user can view a prompt
   *
   * Permission rules:
   * - Prompt must belong to user's current organization
   */
  public async viewPrompt(user: User, prompt: Prompt): Promise<AuthorizerResponse> {
    return user.currentOrganizationId === prompt.organizationId
  }

  /**
   * Check if user can update a prompt
   *
   * Permission rules:
   * - Prompt must belong to user's current organization
   */
  public async updatePrompt(user: User, prompt: Prompt): Promise<AuthorizerResponse> {
    return user.currentOrganizationId === prompt.organizationId
  }

  /**
   * Check if user can delete a prompt
   *
   * Permission rules:
   * - Prompt must belong to user's current organization
   */
  public async deletePrompt(user: User, prompt: Prompt): Promise<AuthorizerResponse> {
    return user.currentOrganizationId === prompt.organizationId
  }
}
