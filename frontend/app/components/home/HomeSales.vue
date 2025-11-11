<script setup lang="ts">
import type { Period, Range } from '~/types/dashboard'

const props = defineProps<{
  period: Period
  range: Range
}>()

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFrom<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)]
}

const sampleEmails = [
  'james.anderson@example.com',
  'mia.white@example.com',
  'william.brown@example.com',
  'emma.davis@example.com',
  'ethan.harris@example.com'
]

interface Sale {
  id: string
  date: string
  status: 'paid' | 'failed' | 'refunded'
  email: string
  amount: number
}

const { data: sales } = await useAsyncData<Sale[]>('sales', async () => {
  const salesData: Sale[] = []
  const currentDate = new Date()

  for (let i = 0; i < 5; i++) {
    const hoursAgo = randomInt(0, 48)
    const date = new Date(currentDate.getTime() - hoursAgo * 3600000)

    salesData.push({
      id: (4600 - i).toString(),
      date: date.toISOString(),
      status: randomFrom(['paid', 'failed', 'refunded'] as const),
      email: randomFrom(sampleEmails),
      amount: randomInt(100, 1000)
    })
  }

  return salesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}, {
  watch: [() => props.period, () => props.range],
  default: () => []
})

const columns = [{
  key: 'id',
  label: 'ID'
}, {
  key: 'date',
  label: 'Date'
}, {
  key: 'status',
  label: 'Statut'
}, {
  key: 'email',
  label: 'Email'
}, {
  key: 'amount',
  label: 'Montant'
}]

const statusColor = (status: string) => {
  if (status === 'paid') return 'success'
  if (status === 'failed') return 'error'
  if (status === 'refunded') return 'warning'
  return 'neutral'
}

const statusLabel = (status: string) => {
  if (status === 'paid') return 'Payé'
  if (status === 'failed') return 'Échoué'
  if (status === 'refunded') return 'Remboursé'
  return status
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">
        Ventes récentes
      </h3>
    </template>

    <template #body>
      <UTable :columns="columns" :rows="sales">
        <template #id-data="{ row }">
          <span class="font-mono text-sm">#{{ row.id }}</span>
        </template>

        <template #date-data="{ row }">
          <span class="text-sm">{{ formatDate(row.date) }}</span>
        </template>

        <template #status-data="{ row }">
          <UBadge :color="statusColor(row.status)" variant="subtle" size="sm">
            {{ statusLabel(row.status) }}
          </UBadge>
        </template>

        <template #amount-data="{ row }">
          <span class="font-medium">{{ formatCurrency(row.amount) }}</span>
        </template>
      </UTable>
    </template>
  </UCard>
</template>
