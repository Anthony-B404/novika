<script setup lang="ts">
import type { TranscriptionTimestamp } from '~/types/audio'

const props = defineProps<{
  segments: TranscriptionTimestamp[]
  currentTime: number
}>()

const emit = defineEmits<{
  seek: [time: number]
}>()

const segmentRefs = ref<HTMLElement[]>([])

// Generate consistent colors for speakers
const speakerColors = [
  'text-blue-500',
  'text-green-500',
  'text-purple-500',
  'text-orange-500',
  'text-pink-500',
  'text-cyan-500',
  'text-yellow-500',
  'text-red-500',
]

// Map speakers to colors
const speakerColorMap = computed(() => {
  const map = new Map<string, string>()
  const uniqueSpeakers = props.segments
    .map(s => s.speaker)
    .filter((s): s is string => typeof s === 'string')
  const uniqueSet = [...new Set(uniqueSpeakers)]
  uniqueSet.forEach((speaker, index) => {
    map.set(speaker, speakerColors[index % speakerColors.length])
  })
  return map
})

function getSpeakerColor (speaker: string | undefined): string {
  if (!speaker) return 'text-muted'
  return speakerColorMap.value.get(speaker) || 'text-muted'
}

function formatTime (seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function isCurrentSegment (segment: TranscriptionTimestamp): boolean {
  return props.currentTime >= segment.start && props.currentTime < segment.end
}

// Find current segment index
const currentSegmentIndex = computed(() =>
  props.segments.findIndex(seg => isCurrentSegment(seg))
)

// Auto-scroll to current segment
watch(currentSegmentIndex, (index) => {
  if (index >= 0 && segmentRefs.value[index]) {
    segmentRefs.value[index].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }
})
</script>

<template>
  <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
    <div
      v-for="(segment, index) in segments"
      :key="index"
      :ref="(el) => { if (el) segmentRefs[index] = el as HTMLElement }"
      :class="[
        'flex gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200',
        isCurrentSegment(segment)
          ? 'bg-primary/10 border-l-2 border-primary'
          : 'hover:bg-elevated border-l-2 border-transparent',
      ]"
      @click="emit('seek', segment.start)"
    >
      <div class="flex flex-col gap-1 shrink-0">
        <UBadge color="primary" variant="subtle" class="font-mono text-xs">
          {{ formatTime(segment.start) }}
        </UBadge>
        <span
          v-if="segment.speaker"
          :class="['text-xs font-medium', getSpeakerColor(segment.speaker)]"
        >
          {{ segment.speaker }}
        </span>
      </div>
      <span class="text-sm leading-relaxed">{{ segment.text }}</span>
    </div>
  </div>
</template>

