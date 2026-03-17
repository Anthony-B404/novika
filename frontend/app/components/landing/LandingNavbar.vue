<script setup lang="ts">
const localePath = useLocalePath()
const mobileOpen = ref(false)

const navLinks = [
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'Métiers', href: '#metiers' },
  { label: 'Comment ça marche', href: '#comment-ca-marche' },
]
</script>

<template>
  <nav class="fixed w-full z-50 top-0 left-0 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <div class="flex-shrink-0 flex items-center gap-2">
          <img src="/logo.png" alt="Novika" class="w-10 h-10">
          <span class="font-bold text-2xl tracking-tight text-slate-900">Novika</span>
        </div>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center space-x-8">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors"
          >
            {{ link.label }}
          </a>
          <a
            href="#contact"
            data-cal-link="anthony-bette-701koy/demo-novika"
            data-cal-namespace="demo-novika"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
            class="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors hover:shadow-lg hover:-translate-y-0.5 transform duration-200 cursor-pointer"
          >
            Réserver une démo
          </a>
        </div>

        <!-- Mobile toggle -->
        <div class="md:hidden">
          <UButton
            :icon="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'"
            color="neutral"
            variant="ghost"
            @click="mobileOpen = !mobileOpen"
          />
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileOpen"
        class="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-4 shadow-xl"
      >
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-purple-600 rounded-md"
          @click="mobileOpen = false"
        >
          {{ link.label }}
        </a>
        <div class="pt-2">
          <a
            href="#contact"
            data-cal-link="anthony-bette-701koy/demo-novika"
            data-cal-namespace="demo-novika"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
            class="block w-full text-center bg-slate-900 text-white px-5 py-3 rounded-xl text-base font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            @click="mobileOpen = false"
          >
            Réserver une démo
          </a>
        </div>
      </div>
    </Transition>
  </nav>
</template>
