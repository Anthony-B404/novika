import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import User from '#models/user'
import DeletionRequest from '#models/deletion_request'

export default class GdprPolicy extends BasePolicy {
  /**
   * Check if user can export their own data
   * Users can only export their own data when they have a current organization
   */
  public async exportData(user: User): Promise<AuthorizerResponse> {
    return user.currentOrganizationId !== null
  }

  /**
   * Check if user can request account deletion
   * Users can only request deletion of their own account
   */
  public async requestDeletion(user: User): Promise<AuthorizerResponse> {
    return user.currentOrganizationId !== null
  }

  /**
   * Check if user can cancel a deletion request
   * Users can only cancel their own deletion request
   */
  public async cancelDeletion(
    user: User,
    deletionRequest: DeletionRequest
  ): Promise<AuthorizerResponse> {
    return user.id === deletionRequest.userId && deletionRequest.canBeCancelled()
  }

  /**
   * Check if user can view their deletion status
   * Users can only view their own deletion status
   */
  public async viewDeletionStatus(user: User): Promise<AuthorizerResponse> {
    return user.currentOrganizationId !== null
  }

  /**
   * Check if user can view their data summary
   * Users can only view their own data summary
   */
  public async viewDataSummary(user: User): Promise<AuthorizerResponse> {
    return user.currentOrganizationId !== null
  }
}
