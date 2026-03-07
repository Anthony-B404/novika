export function useScrollReveal() {
  const observer = ref<IntersectionObserver | null>(null)

  onMounted(() => {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.value?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
  })

  onUnmounted(() => {
    observer.value?.disconnect()
  })

  function reveal(el: HTMLElement | null) {
    if (el && observer.value) {
      observer.value.observe(el)
    }
  }

  return { reveal }
}
