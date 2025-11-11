<script setup lang="ts">
import { computed, ref, watch } from 'vue'

definePageMeta({
  layout: 'app',
})

interface Mail {
  id: number
  from: string
  subject: string
  body: string
  date: string
  unread: boolean
  avatar: {
    src: string
    alt: string
  }
}

const tabItems = [{
  label: 'Tous',
  value: 'all'
}, {
  label: 'Non lus',
  value: 'unread'
}]
const selectedTab = ref('all')

// Mock data - À remplacer par des appels API réels
const { data: mails } = await useAsyncData<Mail[]>('mails', async () => {
  return [
    {
      id: 1,
      from: 'Jean Dupont',
      subject: 'Réunion mensuelle',
      body: 'Bonjour, je souhaiterais organiser une réunion pour discuter des objectifs du mois prochain.',
      date: new Date().toISOString(),
      unread: true,
      avatar: {
        src: 'https://i.pravatar.cc/150?img=1',
        alt: 'Jean Dupont'
      }
    },
    {
      id: 2,
      from: 'Marie Martin',
      subject: 'Nouveau projet',
      body: 'J\'ai une idée pour un nouveau projet que je voudrais partager avec l\'équipe.',
      date: new Date(Date.now() - 86400000).toISOString(),
      unread: false,
      avatar: {
        src: 'https://i.pravatar.cc/150?img=2',
        alt: 'Marie Martin'
      }
    },
    {
      id: 3,
      from: 'Pierre Bernard',
      subject: 'Question technique',
      body: 'Pouvez-vous m\'aider avec un problème technique que je rencontre?',
      date: new Date(Date.now() - 172800000).toISOString(),
      unread: true,
      avatar: {
        src: 'https://i.pravatar.cc/150?img=3',
        alt: 'Pierre Bernard'
      }
    }
  ]
}, { default: () => [] })

const filteredMails = computed(() => {
  if (selectedTab.value === 'unread') {
    return mails.value.filter(mail => !!mail.unread)
  }

  return mails.value
})

const selectedMail = ref<Mail | null>(null)

const isMailPanelOpen = computed({
  get() {
    return !!selectedMail.value
  },
  set(value: boolean) {
    if (!value) {
      selectedMail.value = null
    }
  }
})

watch(filteredMails, () => {
  if (!filteredMails.value.find(mail => mail.id === selectedMail.value?.id)) {
    selectedMail.value = null
  }
})

function selectMail(mail: Mail) {
  selectedMail.value = mail
  if (mail.unread) {
    mail.unread = false
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <UDashboardPanel
    id="inbox-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
  >
    <template #header>
      <UDashboardNavbar title="Boîte de réception">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #trailing>
          <UBadge :label="filteredMails.length" variant="subtle" />
        </template>

        <template #right>
          <UTabs v-model="selectedTab" :items="tabItems" value-key="value" label-key="label" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="divide-y divide-divider">
        <button
          v-for="mail in filteredMails"
          :key="mail.id"
          class="px-4 py-3 hover:bg-elevated/50 w-full text-left"
          :class="{ 'bg-elevated': selectedMail?.id === mail.id }"
          @click="selectMail(mail)"
        >
          <div class="flex items-start gap-3">
            <UChip :show="!!mail.unread" color="primary" inset>
              <UAvatar v-bind="mail.avatar" size="sm" />
            </UChip>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <p class="font-medium text-highlighted truncate">
                  {{ mail.from }}
                </p>
                <time class="text-xs text-muted flex-shrink-0 ml-2">
                  {{ formatDate(mail.date) }}
                </time>
              </div>

              <p class="text-sm font-medium text-dimmed mb-1 truncate">
                {{ mail.subject }}
              </p>

              <p class="text-sm text-muted line-clamp-2">
                {{ mail.body }}
              </p>
            </div>
          </div>
        </button>
      </div>
    </template>
  </UDashboardPanel>

  <UDashboardPanel
    id="inbox-2"
    collapsible
    :model-value="isMailPanelOpen"
    @update:model-value="isMailPanelOpen = $event"
  >
    <template #header>
      <UDashboardNavbar>
        <template #toggle>
          <UDashboardPanelToggle icon="i-lucide-sidebar-open" />

          <UDivider orientation="vertical" class="mx-2" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="selectedMail" class="p-6 space-y-6">
        <div class="space-y-3">
          <h1 class="text-2xl font-semibold text-highlighted">
            {{ selectedMail.subject }}
          </h1>

          <div class="flex items-center gap-3">
            <UAvatar v-bind="selectedMail.avatar" size="sm" />

            <div class="flex-1">
              <p class="font-medium text-highlighted">
                {{ selectedMail.from }}
              </p>
              <p class="text-sm text-muted">
                {{ formatDate(selectedMail.date) }}
              </p>
            </div>
          </div>
        </div>

        <UDivider />

        <div class="prose prose-sm dark:prose-invert max-w-none">
          <p>{{ selectedMail.body }}</p>
        </div>

        <div class="flex gap-2">
          <UButton label="Répondre" icon="i-lucide-reply" />
          <UButton label="Transférer" icon="i-lucide-forward" variant="outline" color="neutral" />
        </div>
      </div>

      <div v-else class="flex items-center justify-center h-full">
        <div class="text-center space-y-3">
          <UIcon name="i-lucide-inbox" class="size-16 text-muted mx-auto" />
          <p class="text-muted">Sélectionnez un message pour le lire</p>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
