<script setup lang="ts">
/**
 * Signup page - Redirects to login
 * Public signup has been disabled. Users are now created by Resellers.
 */
const { $localePath } = useNuxtApp()

definePageMeta({
  layout: 'auth',
})

// Redirect to login page
navigateTo($localePath('/'), { replace: true })
</script>

<template>
  <div />
</template>
