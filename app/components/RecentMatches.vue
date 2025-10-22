<template>
  <div class="h-full">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <Loading />
    </div>
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>
    <div v-else>
      <div class="grid grid-cols-1 gap-4">
        <div v-for="match in matches" :key="match.metadata.matchId"
          class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold">{{ formatGameMode(match.info.gameMode) }}</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(match.info.gameStartTimestamp) }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2">
            <div v-for="participant in match.info.participants" :key="participant.puuid"
              class="flex items-center gap-2 bg-white dark:bg-gray-800 rounded p-2">
              <span class="text-sm">{{ participant.championName }}</span>
              <span class="text-xs text-gray-600 dark:text-gray-400">
                {{ participant.kills }}/{{ participant.deaths }}/{{ participant.assists }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import type { MatchData } from '~/types/api'

const api = useApi()
const loading = ref(true)
const error = ref<string | null>(null)
const matches = ref<MatchData[]>([])

const fetchData = async () => {
  try {
    const { content } = await api.matchData.list({
      page: 0,
      size: 5,
      sort: 'info.gameStartTimestamp,desc'
    })
    matches.value = content
  } catch (e) {
    error.value = 'Failed to load recent matches'
  } finally {
    loading.value = false
  }
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString()
}

const formatGameMode = (mode: string) => {
  return mode.charAt(0) + mode.slice(1).toLowerCase()
}

onMounted(fetchData)
</script>
