<script setup lang="ts">
// Full page skeleton for dashboard to prevent layout shift during initial load
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section skeleton - matches h1 text-3xl (30px) + mt-2 subtitle -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <USkeleton class="h-9 w-52 mb-2" />
        <USkeleton class="h-5 w-96" />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Left: Upload/Record section skeleton -->
      <div class="space-y-6">
        <UCard
          class="transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm ring-1 ring-gray-200 dark:ring-gray-800 shadow-lg dark:shadow-none"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <USkeleton class="w-6 h-6 rounded" />
              <USkeleton class="h-7 w-44" />
            </div>
          </template>

          <!-- Tabs skeleton - UTabs with 2 items -->
          <div class="flex mb-6">
            <USkeleton class="h-10 flex-1 rounded-lg" />
          </div>

          <!-- Upload zone skeleton - matches p-8 padding + content -->
          <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 p-8">
            <div class="flex flex-col items-center gap-3">
              <!-- Icon container w-16 h-16 -->
              <USkeleton class="w-16 h-16 rounded-full" />
              <!-- Text block -->
              <div class="space-y-1 text-center">
                <USkeleton class="h-5 w-64 mx-auto" />
                <USkeleton class="h-4 w-44 mx-auto" />
              </div>
              <!-- Badge -->
              <USkeleton class="h-6 w-56 rounded-full" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right: Audio list skeleton -->
      <div class="space-y-4">
        <UCard
          class="transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm ring-1 ring-gray-200 dark:ring-gray-800 shadow-lg dark:shadow-none"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <USkeleton class="w-6 h-6 rounded" />
                <USkeleton class="h-7 w-28" />
              </div>
              <div class="flex items-center gap-2">
                <USkeleton class="h-6 w-10 rounded-full" />
                <USkeleton class="h-9 w-24 rounded-lg" />
              </div>
            </div>
          </template>

          <!-- Audio cards skeleton (5 cards to match recentAudios) -->
          <div class="space-y-2">
            <WorkshopAudioCardSkeleton v-for="i in 5" :key="i" />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
