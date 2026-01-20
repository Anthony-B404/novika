/**
 * Pending deletion middleware
 * Restricts access to the application when user has a pending account deletion
 * Redirects to dedicated pending-deletion page where user can cancel deletion or export data
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { $localePath } = useNuxtApp()

  // Allow access to pending-deletion page
  if (to.path.includes('/pending-deletion')) {
    return
  }

  const gdprStore = useGdprStore()

  // Fetch deletion status if not already loaded
  if (gdprStore.deletionStatus === null) {
    try {
      await gdprStore.fetchDeletionStatus()
    } catch {
      // If fetch fails, let the user continue
      return
    }
  }

  // If user has pending deletion, redirect to pending-deletion page
  if (gdprStore.hasPendingDeletion) {
    return navigateTo($localePath('/pending-deletion'))
  }
})
