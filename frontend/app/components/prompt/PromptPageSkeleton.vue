<script setup lang="ts">
// Full page skeleton for prompts page to prevent layout shift during initial load
</script>

<template>
  <div class="space-y-6">
    <!-- Header - "Bibliothèque de prompts" is ~280px wide -->
    <div class="flex items-center justify-between">
      <div>
        <USkeleton class="h-9 w-72 mb-1" />
        <USkeleton class="h-5 w-80" />
      </div>
      <div class="flex items-center gap-3">
        <USkeleton class="h-10 w-40 rounded-lg" />
        <USkeleton class="h-10 w-36 rounded-lg" />
      </div>
    </div>

    <!-- Filters card -->
    <UCard class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Search input -->
        <div class="flex-1 min-w-[200px]">
          <USkeleton class="h-10 w-full rounded-lg" />
        </div>
        <!-- Manage categories button -->
        <USkeleton class="h-10 w-44 rounded-lg" />
      </div>

      <!-- Category tabs -->
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex flex-wrap gap-2">
          <USkeleton class="h-8 w-14 rounded-full" />
          <USkeleton class="h-8 w-20 rounded-full" />
          <USkeleton class="h-8 w-20 rounded-full" />
          <USkeleton class="h-8 w-20 rounded-full" />
          <USkeleton class="h-8 w-24 rounded-full" />
          <USkeleton class="h-8 w-22 rounded-full" />
        </div>
      </div>
    </UCard>

    <!-- Prompts grid - 4 cols on xl, 3 on lg, 2 on sm, 1 on mobile -->
    <!-- Show 16 cards to better match typical content -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <PromptCardSkeleton v-for="i in 16" :key="i" />
    </div>
  </div>
</template>
