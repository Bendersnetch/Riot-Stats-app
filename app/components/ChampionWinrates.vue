<template>
  <div class="h-full">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <Loading />
    </div>
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>
    <div v-else>
      <ul class="divide-y">
        <li v-for="champion in winrates" :key="champion.championId" class="py-2 flex justify-between items-center">
          <span>{{ champion.championId }}</span>
          <div class="text-right">
            <div class="text-sm font-semibold">{{ (champion.winrate).toFixed(1) }}%</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">{{ champion.games }} games</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const api = useApi()
const loading = ref(true)
const error = ref<string | null>(null)
const winrates = ref<{ championId: number; games: number; wins: number; winrate: number }[]>([])

const fetchData = async () => {
  try {
    const data = await api.matchData.stats.winrateByChampion()
    winrates.value = data.sort((a, b) => b.winrate - a.winrate).slice(0, 10)
  } catch (e) {
    error.value = 'Failed to load champion winrates'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
