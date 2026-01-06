import { defineStore } from "pinia";

export interface DataSummary {
  profile: {
    email: string;
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    createdAt: string;
  };
  organizations: {
    count: number;
    details: Array<{
      id: number;
      name: string;
      role: string;
      isOwner: boolean;
    }>;
  };
  audios: {
    count: number;
    totalDuration: number;
    totalSize: number;
  };
  transcriptions: {
    count: number;
  };
  documents: {
    count: number;
  };
  credits: {
    balance: number;
    transactionsCount: number;
  };
}

export interface OrphanOrganization {
  id: number;
  name: string;
  membersCount: number;
  members: Array<{
    id: number;
    email: string;
    fullName: string | null;
    role: number;
  }>;
}

export interface DeletionRequest {
  id: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  requestedAt: string;
  scheduledFor: string;
  scheduledForFormatted: string;
  daysRemaining: number;
  canBeCancelled: boolean;
  token: string;
}

export interface DeletionStatus {
  hasPendingRequest: boolean;
  deletionRequest: DeletionRequest | null;
}

export interface OrphanDecision {
  organizationId: number;
  action: "transfer" | "delete";
  newOwnerId?: number;
}

export const useGdprStore = defineStore("gdpr", {
  state: () => ({
    dataSummary: null as DataSummary | null,
    orphanOrganizations: [] as OrphanOrganization[],
    deletionStatus: null as DeletionStatus | null,
    loading: {
      summary: false,
      orphans: false,
      deletion: false,
      export: false,
      cancel: false,
    },
    error: null as string | null,
  }),

  getters: {
    hasPendingDeletion: (state) => state.deletionStatus?.hasPendingRequest ?? false,
    pendingDeletionRequest: (state) => state.deletionStatus?.deletionRequest ?? null,
    hasOrphanOrganizations: (state) => state.orphanOrganizations.length > 0,
  },

  actions: {
    async fetchDataSummary() {
      const { authenticatedFetch } = useAuth();
      this.loading.summary = true;
      this.error = null;

      try {
        const response = await authenticatedFetch("/gdpr/data-summary");
        this.dataSummary = response as DataSummary;
      } catch (err: any) {
        this.error = err.data?.message || "Failed to fetch data summary";
        throw err;
      } finally {
        this.loading.summary = false;
      }
    },

    async fetchOrphanOrganizations() {
      const { authenticatedFetch } = useAuth();
      this.loading.orphans = true;
      this.error = null;

      try {
        const response = await authenticatedFetch("/gdpr/orphan-organizations");
        this.orphanOrganizations = response as OrphanOrganization[];
      } catch (err: any) {
        this.error = err.data?.message || "Failed to fetch orphan organizations";
        throw err;
      } finally {
        this.loading.orphans = false;
      }
    },

    async fetchDeletionStatus() {
      const { authenticatedFetch } = useAuth();
      this.loading.deletion = true;
      this.error = null;

      try {
        const response = await authenticatedFetch("/gdpr/deletion-status");
        this.deletionStatus = response as DeletionStatus;
      } catch (err: any) {
        this.error = err.data?.message || "Failed to fetch deletion status";
        throw err;
      } finally {
        this.loading.deletion = false;
      }
    },

    async downloadExport() {
      const { authenticatedFetch } = useAuth();
      this.loading.export = true;
      this.error = null;

      try {
        const response = await authenticatedFetch("/gdpr/export", {
          responseType: "blob",
        });

        // Create download link
        const blob = new Blob([response as BlobPart], { type: "application/zip" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `dh-echo_export_${new Date().toISOString().split("T")[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err: any) {
        this.error = err.data?.message || "Failed to download export";
        throw err;
      } finally {
        this.loading.export = false;
      }
    },

    async requestDeletion(orphanDecisions: OrphanDecision[] = []) {
      const { authenticatedFetch } = useAuth();
      this.loading.deletion = true;
      this.error = null;

      try {
        const response = await authenticatedFetch("/gdpr/request-deletion", {
          method: "POST",
          body: {
            orphanOrgsDecisions: orphanDecisions,
            confirmDeletion: true,
          },
        });

        // Refresh deletion status
        await this.fetchDeletionStatus();

        return response;
      } catch (err: any) {
        this.error = err.data?.message || "Failed to request deletion";
        throw err;
      } finally {
        this.loading.deletion = false;
      }
    },

    async cancelDeletion(token: string) {
      const { authenticatedFetch } = useAuth();
      this.loading.cancel = true;
      this.error = null;

      try {
        await authenticatedFetch("/gdpr/cancel-deletion", {
          method: "POST",
          body: { token },
        });

        // Refresh deletion status
        await this.fetchDeletionStatus();
      } catch (err: any) {
        this.error = err.data?.message || "Failed to cancel deletion";
        throw err;
      } finally {
        this.loading.cancel = false;
      }
    },

    reset() {
      this.dataSummary = null;
      this.orphanOrganizations = [];
      this.deletionStatus = null;
      this.error = null;
    },
  },
});
