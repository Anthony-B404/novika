import { defineStore } from "pinia";
import type { Organization, OrganizationState, UserOrganization } from "~/types/organization";

export const useOrganizationStore = defineStore("organization", {
  state: (): OrganizationState => ({
    organization: null,
    organizations: [],
    loading: false,
    error: null,
  }),

  getters: {
    getOrganization: (state) => state.organization,
    userOrganizations: (state) => state.organizations,
    currentOrganization: (state) => state.organizations.find(org => org.isCurrent) || null,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    getError: (state) => state.error,
    organizationName: (state) => state.organization?.name || "",
    organizationLogo: (state) => state.organization?.logo || null,
    organizationUsers: (state) => state.organization?.users || [],
    organizationInvitations: (state) => state.organization?.invitations || [],
    // Organization status getters
    organizationStatus: (state) => state.organization?.status || 'active',
    isOrganizationSuspended: (state) => state.organization?.status === 'suspended',
    isOrganizationDeleted: (state) => state.organization?.status === 'deleted',
    isOrganizationUnavailable: (state) =>
      state.organization?.status === 'suspended' ||
      state.organization?.status === 'deleted',
    suspensionReason: (state) => state.organization?.suspensionReason || null,
    suspendedAt: (state) => state.organization?.suspendedAt || null,
    deletedAt: (state) => state.organization?.deletedAt || null,
  },

  actions: {
    /**
     * Set organization data
     */
    setOrganization(organization: Organization | null) {
      this.organization = organization;
    },

    /**
     * Set organizations list
     */
    setOrganizations(organizations: UserOrganization[]) {
      this.organizations = organizations;
    },

    /**
     * Set error state
     */
    setError(error: string | null) {
      this.error = error;
    },

    /**
     * Fetch organization data from API
     */
    async fetchOrganization() {
      this.loading = true;
      this.error = null;

      try {
        const { authenticatedFetch } = useAuth();
        const response = await authenticatedFetch<Organization>("/organization");
        this.setOrganization(response);
      } catch (error: any) {
        console.error("Failed to fetch organization:", error);
        this.setError(error?.message || "Failed to load organization");
        this.setOrganization(null);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch all user organizations from API
     */
    async fetchUserOrganizations() {
      this.loading = true;
      this.error = null;

      try {
        const { authenticatedFetch } = useAuth();
        const response = await authenticatedFetch<UserOrganization[]>("/organizations");
        this.setOrganizations(response);

        // Also update the current organization detail
        const current = response.find(org => org.isCurrent);
        if (current) {
          // Fetch full organization details for the current one
          await this.fetchOrganization();
        }
      } catch (error: any) {
        console.error("Failed to fetch user organizations:", error);
        this.setError(error?.message || "Failed to load organizations");
        this.setOrganizations([]);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Clear organization data
     */
    clearOrganization() {
      this.organization = null;
      this.organizations = [];
      this.loading = false;
      this.error = null;
    },
  },
});
