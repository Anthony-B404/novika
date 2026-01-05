<template>
  <div class="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
    <main class="flex flex-1 items-center justify-center px-4 py-8">
      <UPageCard
        variant="subtle"
        class="max-w-lg w-full"
      >
        <slot />
      </UPageCard>
    </main>
    <AppFooter />
  </div>
</template>
