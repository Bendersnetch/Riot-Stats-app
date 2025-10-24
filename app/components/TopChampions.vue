<template>
  <div class="h-full">
    <div v-if="effectiveLoading" class="flex items-center justify-center h-full">
      <Loading />
    </div>
    <div v-else-if="error" class="text-red-600 dark:text-red-400">
      {{ error }}
    </div>
    <div v-else>
      <ul class="divide-y divide-blue-200 dark:divide-blue-800">
        <li
          v-for="champion in effectiveChampions"
          :key="champion.championId"
          class="py-2 flex justify-between items-center"
        >
          <div class="flex items-center gap-3 min-w-0">
            <img
              :src="tileSrc(champion.championName)"
              @error="onImgError"
              :alt="champion.championName || `Champion ${champion.championId}`"
              class="h-8 w-8 rounded object-cover flex-shrink-0 ring-1 ring-blue-200 dark:ring-blue-700"
              loading="lazy"
              decoding="async"
            />
            <span class="truncate text-blue-950 dark:text-blue-300">
              {{ champion.championName || `Champion ${champion.championId}` }}
            </span>
          </div>
          <span class="text-blue-900 dark:text-blue-400 whitespace-nowrap">{{ champion.count }} games</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '~/composables/useApi'

// Optional props from parent; if provided, we use them and skip local fetch
const props = defineProps<{
  champions?: { championId: number; count: number; championName?: string }[]
  isLoading?: boolean
}>()

const api = useApi()
const localLoading = ref(true)
const error = ref<string | null>(null)
const localChampions = ref<{ championId: number; count: number; championName?: string }[]>([])

const fetchData = async () => {
  try {
    const data = await api.matchData.stats.champions({ limit: 10 })
    // Accept championName if backend supplies it; otherwise fallback kept in template
    localChampions.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = 'Failed to load champion statistics'
  } finally {
    localLoading.value = false
  }
}

// Resolve to parent-provided or local state
const effectiveChampions = computed(() => props.champions ?? localChampions.value)
const effectiveLoading = computed(() => props.isLoading ?? localLoading.value)

onMounted(() => {
  // If parent did not pass data, fetch locally
  if (props.champions === undefined) {
    fetchData()
  } else {
    localLoading.value = false
  }
})

// Helper to build tile image src (default to _0 skin)
const tileSrc = (name?: string) => {
  return name ? `/tiles/${name}_0.jpg` : '/favicon.ico'
}

// Fallback image handler if a tile is missing
const onImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  if (img && img.src.indexOf('/favicon.ico') === -1) {
    img.src = '/favicon.ico'
  }
}
</script>
