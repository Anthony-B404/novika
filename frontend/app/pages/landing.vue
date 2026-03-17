<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({
  script: [
    { src: 'https://player.vimeo.com/api/player.js', defer: true },
  ],
})

// Cal.com embed initialization
onMounted(() => {
  const w = window as any
  ;(function (C: any, A: string, L: string) {
    const p = function (a: any, ar: any) { a.q.push(ar) }
    const d = C.document
    C.Cal = C.Cal || function () {
      const cal = C.Cal
      const ar = arguments
      if (!cal.loaded) {
        cal.ns = {}
        cal.q = cal.q || []
        d.head.appendChild(d.createElement('script')).src = A
        cal.loaded = true
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments) }
        const namespace = ar[1]
        api.q = api.q || []
        if (typeof namespace === 'string') {
          cal.ns[namespace] = cal.ns[namespace] || api
          p(cal.ns[namespace], ar)
          p(cal, ['initNamespace', namespace])
        } else {
          p(cal, ar)
        }
        return
      }
      p(cal, ar)
    }
  })(w, 'https://app.cal.com/embed/embed.js', 'init')

  w.Cal('init', 'demo-novika', { origin: 'https://app.cal.com' })
  w.Cal.ns['demo-novika']('ui', { hideEventTypeDetails: false, layout: 'month_view' })
})

useSeoMeta({
  title: 'Novika — Dictez, votre document est prêt',
  description: 'Transformez vos enregistrements audio en documents structurés prêts à l\'emploi en 2 minutes. Adapté aux avocats, médecins et consultants. Hébergé en France, conforme RGPD.',
  ogTitle: 'Novika — Dictez, votre document est prêt',
  ogDescription: 'De l\'audio brut au document professionnel en 2 minutes. Adapté aux avocats, médecins et consultants.',
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans selection:bg-purple-200 selection:text-purple-900">
    <LandingNavbar />
    <main>
      <LandingHero />
      <LandingVideoDemo />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingTargetAudience />
      <LandingSecurity />
      <LandingCTA />
    </main>
    <LandingFooter />
  </div>
</template>
