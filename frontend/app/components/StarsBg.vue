<script setup lang="ts">
interface Star {
  x: number
  y: number
  size: number
}

const props = withDefaults(defineProps<{
  starCount?: number
  color?: string
  speed?: 'slow' | 'normal' | 'fast'
  size?: { min: number, max: number }
}>(), {
  starCount: 300,
  color: 'var(--ui-primary)',
  speed: 'normal',
  size: () => ({
    min: 1,
    max: 2
  })
})

const generateStars = (count: number): Star[] => {
  return Array.from({ length: count }, () => ({
    x: Math.floor(Math.random() * 2000),
    y: Math.floor(Math.random() * 2000),
    size: typeof props.size === 'number'
      ? props.size
      : Math.random() * (props.size.max - props.size.min) + props.size.min
  }))
}

const speedMap = {
  slow: { duration: 200, opacity: 0.5, ratio: 0.3 },
  normal: { duration: 150, opacity: 0.75, ratio: 0.3 },
  fast: { duration: 100, opacity: 1, ratio: 0.4 }
}

const stars = useState<{ slow: Star[], normal: Star[], fast: Star[] }>('stars', () => {
  return {
    slow: generateStars(Math.floor(props.starCount * speedMap.slow.ratio)),
    normal: generateStars(Math.floor(props.starCount * speedMap.normal.ratio)),
    fast: generateStars(Math.floor(props.starCount * speedMap.fast.ratio))
  }
})

const starLayers = computed(() => [
  { stars: stars.value.fast, ...speedMap.fast },
  { stars: stars.value.normal, ...speedMap.normal },
  { stars: stars.value.slow, ...speedMap.slow }
])
</script>

<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      v-for="(layer, layerIndex) in starLayers"
      :key="layerIndex"
      class="absolute inset-0"
      :style="{ opacity: layer.opacity }"
    >
      <div
        v-for="(star, starIndex) in layer.stars"
        :key="starIndex"
        class="absolute rounded-full"
        :style="{
          left: `${star.x}px`,
          top: `${star.y}px`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          backgroundColor: color,
          animation: `twinkle ${layer.duration}s ease-in-out infinite`,
          animationDelay: `${Math.random() * layer.duration}s`
        }"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
</style>
