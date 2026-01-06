<script setup lang="ts">
// Skeleton component that mirrors AudioCard structure for zero layout shift
</script>

<template>
  <div class="w-full p-4 rounded-lg border border-default bg-elevated/30 animate-pulse">
    <div class="flex items-start gap-4">
      <!-- Icon skeleton -->
      <USkeleton class="flex-shrink-0 w-12 h-12 rounded-lg" />

      <!-- Content skeleton -->
      <div class="flex-1 min-w-0">
        <!-- Title + badge row -->
        <div class="flex items-center gap-2 mb-1">
          <USkeleton class="h-5 w-48" />
          <USkeleton class="h-5 w-20 rounded-full" />
        </div>

        <!-- Metadata row -->
        <div class="flex items-center gap-3">
          <USkeleton class="h-4 w-14" />
          <USkeleton class="h-4 w-16" />
          <USkeleton class="h-4 w-24" />
        </div>
      </div>
    </div>
  </div>
</template>
