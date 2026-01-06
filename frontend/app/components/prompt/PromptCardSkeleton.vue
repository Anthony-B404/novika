<script setup lang="ts">
// Skeleton component that mirrors PromptCard structure for zero layout shift
</script>

<template>
  <div
    class="w-full min-w-0 flex h-full flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4"
  >
    <!-- Header -->
    <div class="mb-2 flex items-start justify-between">
      <div class="flex-1 pr-2">
        <!-- Title -->
        <USkeleton class="h-4 w-32 mb-1" />
        <!-- Category - min-h-[1rem] to match real card -->
        <div class="mt-1 flex items-center gap-1 min-h-[1rem]">
          <USkeleton class="h-2 w-2 rounded-full" />
          <USkeleton class="h-3 w-16" />
        </div>
      </div>
      <!-- Favorite button placeholder -->
      <USkeleton class="h-6 w-6 rounded" />
    </div>

    <!-- Content preview - flex-1 + line-clamp-3 equivalent height -->
    <div class="mb-3 flex-1 space-y-1">
      <USkeleton class="h-3 w-full" />
      <USkeleton class="h-3 w-full" />
      <USkeleton class="h-3 w-3/4" />
    </div>

    <!-- Footer - min-h-[1.5rem] to match real card -->
    <div class="flex items-center justify-between min-h-[1.5rem]">
      <div class="flex items-center gap-2">
        <USkeleton class="h-4 w-8" />
        <USkeleton class="h-5 w-16 rounded" />
      </div>
      <!-- Actions placeholder (hidden on real card until hover) -->
      <div class="flex gap-1 opacity-0">
        <USkeleton class="h-6 w-6 rounded" />
        <USkeleton class="h-6 w-6 rounded" />
      </div>
    </div>
  </div>
</template>
