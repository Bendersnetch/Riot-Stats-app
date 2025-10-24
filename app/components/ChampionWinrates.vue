<template>
  <div class="dashboard-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full transition-colors">
    <span class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 block">Top 10 Champion Winrates</span>
    <div class="h-full">
      <div v-if="effectiveLoading" class="flex items-center justify-center h-full">
        <Loading/>
      </div>
      <div v-else-if="error" class="text-red-600 dark:text-red-400">
        {{ error }}
      </div>
      <div v-else>
        <ul class="divide-y divide-blue-200 dark:divide-blue-800">
          <li v-for="champion in effectiveWinrates" :key="champion.championId" class="py-2 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <img
                v-if="champion.championName"
                :src="`/tiles/${champion.championName}_0.jpg`"
                :alt="champion.championName"
                class="w-8 h-8 rounded object-cover"
                @error="($event.target as HTMLImageElement).style.display='none'"
              />
              <span class="text-blue-950 dark:text-blue-300">{{ champion.championName || champion.championId }}</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-blue-900 dark:text-blue-400">{{ (champion.winrate).toFixed(1) }}%</div>
              <div class="text-xs text-blue-900 dark:text-blue-400">{{ champion.games }} games</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '~/composables/useApi'

// Optional props from parent; if provided, we use them and skip local fetch
const props = defineProps<{
  winrates?: { championId: number; championName?: string; games: number; wins: number; winrate: number }[]
  isLoading?: boolean
}>()

const api = useApi()
const localLoading = ref(true)
const error = ref<string | null>(null)
const localWinrates = ref<{ championId: number; championName?: string; games: number; wins: number; winrate: number }[]>([])

const fetchData = async () => {
  try {
    const data = await api.matchData.stats.winrateByChampion()
    localWinrates.value = (data || []).sort((a: any, b: any) => b.winrate - a.winrate).slice(0, 10)
  } catch (e) {
    error.value = 'Failed to load champion winrates'
  } finally {
    localLoading.value = false
  }
}

// Effective data resolves to props first, then local
const effectiveWinrates = computed(() => props.winrates ?? localWinrates.value)
const effectiveLoading = computed(() => props.isLoading ?? localLoading.value)

onMounted(() => {
  // If parent did not pass data, fetch locally
  if (props.winrates === undefined) {
    fetchData()
  } else {
    // Parent controls loading; ensure local loading is false to avoid overlaying
    localLoading.value = false
  }
})
</script>
