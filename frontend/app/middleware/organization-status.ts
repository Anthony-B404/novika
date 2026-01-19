/**
 * Organization status middleware
 * Blocks access to dashboard when organization is suspended or deleted.
 * Unlike pending-deletion, this does NOT offer reactivation options.
 * Users must contact their reseller to restore access.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { $localePath } = useNuxtApp();

  // Allow access to organization-unavailable page
  if (to.path.includes("/organization-unavailable")) {
    return;
  }

  const organizationStore = useOrganizationStore();

  // Fetch organization if not loaded
  if (!organizationStore.organization) {
    try {
      await organizationStore.fetchOrganization();
    } catch {
      // If fetch fails, let the user continue (auth middleware will handle unauthorized)
      return;
    }
  }

  // Redirect if organization is unavailable (suspended or deleted)
  if (organizationStore.isOrganizationUnavailable) {
    return navigateTo($localePath("/organization-unavailable"));
  }
});
