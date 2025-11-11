<script setup lang="ts">
const form = reactive({
  name: 'Utilisateur',
  email: 'user@example.com',
  bio: 'Développeur passionné'
})

const toast = useToast()

function saveProfile() {
  toast.add({
    title: 'Profil sauvegardé',
    description: 'Vos informations ont été mises à jour avec succès'
  })
}
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">Profil</h3>
      <p class="text-sm text-muted">Gérez les informations de votre profil</p>
    </template>

    <template #body>
      <div class="space-y-4">
        <UFormField label="Nom" required>
          <UInput v-model="form.name" placeholder="Votre nom" />
        </UFormField>

        <UFormField label="Email" required>
          <UInput v-model="form.email" type="email" placeholder="votre@email.com" />
        </UFormField>

        <UFormField label="Bio">
          <UTextarea v-model="form.bio" placeholder="Parlez-nous de vous" />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton @click="saveProfile">Enregistrer</UButton>
      </div>
    </template>
  </UCard>
</template>
