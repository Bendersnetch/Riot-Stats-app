<template>
  <div>
    <div v-if="isLoading" class="flex items-center justify-center h-48">
      <Loading />
    </div>

    <div v-else-if="!durationStats || (!durationStats.min && !durationStats.max)" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No duration data available</h3>
      <p class="mt-1 text-sm text-gray-500">Check back later when more matches are available.</p>
    </div>

    <div v-else>
      <!-- Duration Cards -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div class="text-xs text-blue-700 mb-1 font-medium">Shortest Match</div>
          <div class="text-lg font-bold text-blue-900">{{ formatDuration(durationStats.min) }}</div>
        </div>

        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div class="text-xs text-purple-700 mb-1 font-medium">Average Duration</div>
          <div class="text-lg font-bold text-purple-900">{{ formatDuration(durationStats.avg) }}</div>
        </div>

        <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
          <div class="text-xs text-indigo-700 mb-1 font-medium">Longest Match</div>
          <div class="text-lg font-bold text-indigo-900">{{ formatDuration(durationStats.max) }}</div>
        </div>
      </div>

      <!-- Duration Range Visualization -->
      <div class="mt-6">
        <div class="relative h-8 bg-gray-200 rounded-full overflow-hidden">
          <!-- Gradient Range Bar -->
          <div class="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600"></div>

          <!-- Average Marker -->
          <div class="absolute top-0 bottom-0 w-0.5 bg-white" :style="{ left: `${avgPercentage}%` }">
            <div class="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-white text-xs font-bold text-gray-800 px-2 py-1 rounded shadow-sm">
              AVG
            </div>
          </div>

          <!-- Min Label -->
          <div class="absolute bottom-1 left-2 text-xs font-medium text-white">
            {{ formatDuration(durationStats.min) }}
          </div>

          <!-- Max Label -->
          <div class="absolute bottom-1 right-2 text-xs font-medium text-white">
            {{ formatDuration(durationStats.max) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  durationStats: { min: number; max: number; avg: number }
  isLoading: boolean
}>()

const formatDuration = (seconds?: number) => {
  if (!seconds && seconds !== 0) return '0:00'
  const s = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(s / 60)
  const remainingSeconds = s % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const avgPercentage = computed(() => {
  const { min, max, avg } = props.durationStats || { min: 0, max: 0, avg: 0 }
  const range = Math.max(1, max - min)
  const clamped = Math.min(Math.max(avg - min, 0), range)
  return (clamped / range) * 100
})
</script>
