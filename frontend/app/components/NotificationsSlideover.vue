<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard()

// Mock data - À remplacer par des appels API réels
const notifications = ref([
  {
    id: 1,
    sender: {
      name: 'Jean Dupont',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=1',
        alt: 'Jean Dupont'
      }
    },
    body: 'Vous a envoyé un message',
    date: new Date().toISOString(),
    unread: true
  },
  {
    id: 2,
    sender: {
      name: 'Marie Martin',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=2',
        alt: 'Marie Martin'
      }
    },
    body: 'A commenté votre publication',
    date: new Date(Date.now() - 3600000).toISOString(),
    unread: true
  },
  {
    id: 3,
    sender: {
      name: 'Pierre Bernard',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=3',
        alt: 'Pierre Bernard'
      }
    },
    body: 'A partagé un fichier avec vous',
    date: new Date(Date.now() - 7200000).toISOString(),
    unread: false
  }
])
</script>

<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="Notifications"
  >
    <template #body>
      <NuxtLink
        v-for="notification in notifications"
        :key="notification.id"
        :to="`/dashboard/inbox?id=${notification.id}`"
        class="px-3 py-2.5 rounded-md hover:bg-elevated/50 flex items-center gap-3 relative -mx-3 first:-mt-3 last:-mb-3"
      >
        <UChip
          color="error"
          :show="!!notification.unread"
          inset
        >
          <UAvatar
            v-bind="notification.sender.avatar"
            :alt="notification.sender.name"
            size="md"
          />
        </UChip>

        <div class="text-sm flex-1">
          <p class="flex items-center justify-between">
            <span class="text-highlighted font-medium">{{ notification.sender.name }}</span>

            <time
              :datetime="notification.date"
              class="text-muted text-xs"
              v-text="formatTimeAgo(new Date(notification.date), { messages: { justNow: 'à l\'instant', past: n => n, future: n => `dans ${n}`, second: n => `${n} seconde${n > 1 ? 's' : ''}`, minute: n => `${n} minute${n > 1 ? 's' : ''}`, hour: n => `${n} heure${n > 1 ? 's' : ''}`, day: n => `${n} jour${n > 1 ? 's' : ''}`, week: n => `${n} semaine${n > 1 ? 's' : ''}`, month: n => `${n} mois`, year: n => `${n} an${n > 1 ? 's' : ''}` } })"
            />
          </p>

          <p class="text-dimmed">
            {{ notification.body }}
          </p>
        </div>
      </NuxtLink>
    </template>
  </USlideover>
</template>
