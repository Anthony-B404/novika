<script setup lang="ts">
defineProps<{
  title: string
  value: number | string
  subtitle?: string
  icon: string
  color?: 'primary' | 'info' | 'success' | 'warning' | 'error'
}>()
</script>

<template>
  <UCard class="relative overflow-hidden">
    <div class="flex items-center gap-4">
      <div
        :class="[
          'flex items-center justify-center w-12 h-12 rounded-xl',
          {
            'bg-primary-100 dark:bg-primary-900/30 text-primary-500': color === 'primary',
            'bg-blue-100 dark:bg-blue-900/30 text-blue-500': color === 'info',
            'bg-green-100 dark:bg-green-900/30 text-green-500': color === 'success',
            'bg-orange-100 dark:bg-orange-900/30 text-orange-500': color === 'warning',
            'bg-red-100 dark:bg-red-900/30 text-red-500': color === 'error',
          },
        ]"
      >
        <UIcon :name="icon" class="w-6 h-6" />
      </div>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ title }}
        </p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ value }}
        </p>
        <p v-if="subtitle" class="text-xs text-gray-400">
          {{ subtitle }}
        </p>
      </div>
    </div>
  </UCard>
</template>
