<script setup lang="ts">
const { reveal } = useScrollReveal()
</script>

<template>
  <section id="contact" class="py-20 bg-slate-50 relative overflow-hidden">
    <!-- Decorative blobs -->
    <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
    <div class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div
        :ref="(el: any) => reveal(el)"
        class="scroll-reveal bg-slate-900 rounded-3xl p-10 md:p-16 text-center shadow-2xl overflow-hidden relative"
      >
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 pointer-events-none"></div>

        <div class="relative z-10">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
            Prêt à arrêter de rédiger vos comptes-rendus ?
          </h2>
          <p class="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Testez Novika avec un de vos propres enregistrements. 15 minutes de démo, et vous verrez votre audio se transformer en document sous vos yeux.
          </p>

          <a
            href="mailto:contact@novika.app"
            class="inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-5 rounded-full text-lg font-bold hover:bg-slate-50 hover:scale-105 hover:shadow-xl transition-all duration-300 transform group"
          >
            <UIcon name="i-lucide-calendar-days" class="w-6 h-6 text-purple-600 group-hover:rotate-12 transition-transform" />
            Réserver votre démo personnalisée
          </a>
          <p class="mt-6 text-sm text-slate-400">
            Démo de 15 min avec votre audio &bull; Sans engagement &bull; Résultat immédiat
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
