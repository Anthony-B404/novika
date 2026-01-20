/**
 * Admin composable
 * Provides admin permission checks for Super Admin users
 */
export const useAdmin = () => {
  const { user, isAuthenticated } = useAuth()

  /**
   * Check if current user is a super admin
   */
  const isSuperAdmin = computed(() => {
    return isAuthenticated.value && user.value?.isSuperAdmin === true
  })

  /**
   * Check if current user can access admin panel
   */
  const canAccessAdmin = computed(() => isSuperAdmin.value)

  return {
    isSuperAdmin,
    canAccessAdmin
  }
}
