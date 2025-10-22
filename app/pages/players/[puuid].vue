<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="flex justify-center">
      <Loading />
    </div>
    <div v-else-if="error" class="text-red-500 text-center">
      {{ error }}
    </div>
    <template v-else>
      <!-- Player Info Header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold mb-2">Player Details</h1>
            <div class="text-lg">{{ player.tier }} {{ player.rank }}</div>
            <div class="text-gray-600 dark:text-gray-400">{{ player.leaguePoints }} LP</div>
          </div>
          <div class="text-right">
            <div class="text-lg font-semibold">
              {{ ((player.wins / (player.wins + player.losses)) * 100).toFixed(1) }}% Win Rate
            </div>
            <div class="text-gray-600 dark:text-gray-400">
              {{ player.wins }}W {{ player.losses }}L
            </div>
            <div class="mt-2 text-sm">
              <span v-if="player.veteran" class="mr-2 text-blue-500">Veteran</span>
              <span v-if="player.freshBlood" class="mr-2 text-green-500">Fresh Blood</span>
              <span v-if="player.inactive" class="text-red-500">Inactive</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Match History -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-4">Recent Matches</h2>
        <div v-if="loadingMatches" class="flex justify-center py-4">
          <Loading />
        </div>
        <div v-else class="space-y-4">
          <div v-for="match in matches" :key="match.metadata.matchId"
            class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <div>
                <span class="font-semibold">{{ match.info.gameMode }}</span>
                <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  {{ formatDuration(match.info.gameDuration) }}
                </span>
              </div>
              <span class="text-sm">
                {{ formatDate(match.info.gameStartTimestamp) }}
              </span>
            </div>

            <!-- Player Performance -->
            <div v-if="playerMatchStats(match)" class="mt-2">
              <div class="flex items-center gap-4">
                <div>
                  <span class="font-medium">{{ playerMatchStats(match).championName }}</span>
                  <span class="text-sm ml-2">
                    {{ playerMatchStats(match).kills }}/{{ playerMatchStats(match).deaths }}/{{ playerMatchStats(match).assists }}
                  </span>
                </div>
                <div :class="playerMatchStats(match).win ? 'text-green-500' : 'text-red-500'">
                  {{ playerMatchStats(match).win ? 'Victory' : 'Defeat' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex justify-center gap-2 mt-4">
            <button
              @click="matchesPage--"
              :disabled="matchesPage === 0"
              class="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300">
              Previous
            </button>
            <button
              @click="matchesPage++"
              :disabled="!hasMoreMatches"
              class="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300">
              Next
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'
import type { Player, MatchData, MatchDataParticipant } from '~/types/api'

const route = useRoute()
const api = useApi()
const puuid = route.params.puuid as string

const loading = ref(true)
const loadingMatches = ref(true)
const error = ref<string | null>(null)
const player = ref<Player | null>(null)
const matches = ref<MatchData[]>([])
const matchesPage = ref(0)
const hasMoreMatches = ref(true)

const fetchPlayer = async () => {
  try {
    const data = await api.players.getByPuuid(puuid)
    player.value = data
  } catch (e) {
    error.value = 'Failed to load player details'
  } finally {
    loading.value = false
  }
}

const fetchMatches = async () => {
  loadingMatches.value = true
  try {
    const { content, totalPages } = await api.players.getMatches(puuid, {
      page: matchesPage.value,
      size: 10
    })
    matches.value = content
    hasMoreMatches.value = matchesPage.value < totalPages - 1
  } catch (e) {
    console.error('Failed to load matches')
  } finally {
    loadingMatches.value = false
  }
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString()
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const playerMatchStats = (match: MatchData): MatchDataParticipant | undefined => {
  return match.info.participants.find(p => p.puuid === puuid)
}

onMounted(() => {
  fetchPlayer()
  fetchMatches()
})

watch(matchesPage, fetchMatches)
</script>
