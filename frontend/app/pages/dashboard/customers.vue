<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

definePageMeta({
  layout: 'app',
})

interface Customer {
  id: number
  name: string
  email: string
  location: string
  status: 'active' | 'inactive'
  avatar: {
    src: string
    alt: string
  }
}

const toast = useToast()

// State management
const searchQuery = ref('')
const statusFilter = ref('all')
const page = ref(1)
const pageSize = ref(10)

// Mock data - À remplacer par des appels API réels
const { data: customers, status } = await useAsyncData<Customer[]>('customers', async () => {
  // Simuler un appel API
  return [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      location: 'Paris, France',
      status: 'active',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=1',
        alt: 'Jean Dupont'
      }
    },
    {
      id: 2,
      name: 'Marie Martin',
      email: 'marie.martin@example.com',
      location: 'Lyon, France',
      status: 'active',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=2',
        alt: 'Marie Martin'
      }
    },
    {
      id: 3,
      name: 'Pierre Bernard',
      email: 'pierre.bernard@example.com',
      location: 'Marseille, France',
      status: 'inactive',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=3',
        alt: 'Pierre Bernard'
      }
    }
  ]
}, { lazy: true })

// Filtrage
const filteredCustomers = computed(() => {
  if (!customers.value) return []

  return customers.value.filter((customer) => {
    const matchesSearch = !searchQuery.value ||
      customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = statusFilter.value === 'all' || customer.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

// Pagination
const paginatedCustomers = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCustomers.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / pageSize.value))

// Colonnes du tableau
const columns = [{
  key: 'name',
  label: 'Nom'
}, {
  key: 'email',
  label: 'Email'
}, {
  key: 'location',
  label: 'Localisation'
}, {
  key: 'status',
  label: 'Statut'
}, {
  key: 'actions',
  label: 'Actions'
}]

// Actions par ligne
function getRowActions(customer: Customer): DropdownMenuItem[][] {
  return [[{
    label: 'Copier l\'ID client',
    icon: 'i-lucide-copy',
    onSelect() {
      navigator.clipboard.writeText(customer.id.toString())
      toast.add({ title: 'ID copié dans le presse-papier' })
    }
  }, {
    label: 'Voir les détails',
    icon: 'i-lucide-eye'
  }], [{
    label: 'Supprimer le client',
    icon: 'i-lucide-trash',
    color: 'error',
    onSelect() {
      toast.add({ title: 'Client supprimé', color: 'error' })
    }
  }]]
}

const statusColor = (status: string) => status === 'active' ? 'success' : 'neutral'
const statusLabel = (status: string) => status === 'active' ? 'Actif' : 'Inactif'
</script>

<template>
  <UDashboardPanel id="customers">
    <template #header>
      <UDashboardNavbar title="Clients">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-user-plus" label="Nouveau client" />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Rechercher des clients..."
            class="w-64"
          />

          <USelect
            v-model="statusFilter"
            :items="[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'active', label: 'Actif' },
              { value: 'inactive', label: 'Inactif' }
            ]"
            value-key="value"
            label-key="label"
            variant="ghost"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UTable
        :columns="columns"
        :rows="paginatedCustomers"
        :loading="status === 'pending'"
        :ui="{ divide: 'divide-y divide-divider' }"
      >
        <template #name-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar v-bind="row.avatar" size="sm" />
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>

        <template #status-data="{ row }">
          <UBadge :color="statusColor(row.status)" variant="subtle" size="sm">
            {{ statusLabel(row.status) }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <UDropdownMenu :items="getRowActions(row)">
            <UButton
              icon="i-lucide-more-horizontal"
              color="neutral"
              variant="ghost"
              square
              size="sm"
            />
          </UDropdownMenu>
        </template>
      </UTable>

      <div class="flex items-center justify-between px-4 py-3 border-t border-divider">
        <p class="text-sm text-muted">
          {{ filteredCustomers.length }} client{{ filteredCustomers.length > 1 ? 's' : '' }} au total
        </p>

        <UPagination
          v-model="page"
          :total="totalPages"
          :ui="{ rounded: 'rounded-full' }"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
