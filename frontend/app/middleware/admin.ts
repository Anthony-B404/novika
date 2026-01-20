/**
 * Admin middleware
 * Protects admin routes - requires isSuperAdmin = true
 * Redirects to dashboard if user is not a super admin
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, user } = useAuth()
  const localePath = useLocalePath()

  // First check authentication
  if (!isAuthenticated.value) {
    return navigateTo({
      path: localePath('/'),
      query: {
        redirect: to.fullPath
      }
    })
  }

  // Then check super admin status
  if (!user.value?.isSuperAdmin) {
    // Redirect to dashboard - user is authenticated but not a super admin
    return navigateTo(localePath('/dashboard'))
  }
})
