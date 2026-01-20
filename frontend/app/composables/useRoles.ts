import { UserRole } from '~/types/auth'
import type { User } from '~/types/auth'

export const useRoles = () => {
  const { t } = useI18n()

  /**
   * Get localized role label
   */
  const getRoleLabel = (role: UserRole): string => {
    const roleMap: Record<UserRole, string> = {
      [UserRole.Owner]: t('common.roles.owner'),
      [UserRole.Administrator]: t('common.roles.administrator'),
      [UserRole.Member]: t('common.roles.member')
    }
    return roleMap[role]
  }

  /**
   * Get all available roles with labels for select dropdowns
   */
  const getRoleOptions = () => [
    { label: t('common.roles.owner'), value: UserRole.Owner },
    { label: t('common.roles.administrator'), value: UserRole.Administrator },
    { label: t('common.roles.member'), value: UserRole.Member }
  ]

  /**
   * Check if user is owner
   */
  const isOwner = (user: User): boolean => user.role === UserRole.Owner

  /**
   * Check if user is administrator
   */
  const isAdministrator = (user: User): boolean => user.role === UserRole.Administrator

  /**
   * Check if user is member
   */
  const isMember = (user: User): boolean => user.role === UserRole.Member

  /**
   * Check if user has admin privileges (Owner or Administrator)
   */
  const hasAdminPrivileges = (user: User): boolean =>
    user.role === UserRole.Owner || user.role === UserRole.Administrator

  return {
    getRoleLabel,
    getRoleOptions,
    isOwner,
    isAdministrator,
    isMember,
    hasAdminPrivileges
  }
}
