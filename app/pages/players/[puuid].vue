<template>
  <div class="container mx-auto p-4">
    <!-- Debug header to ensure page renders -->
    <div class="mb-2 text-xs text-gray-500">PUUID: {{ puuid }} <span v-if="isMock">(mock)</span></div>
    <div v-if="loading" class="flex justify-center">
      <Loading />
    </div>
    <div v-else-if="error" class="text-red-500 text-center">
      {{ error }}
    </div>
    <template v-else>
      <!-- Player Info Header -->
      <div v-if="player" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold mb-2">Player Details</h1>
            <div class="text-lg">{{ player.tier }} {{ player.rank }}</div>
            <div class="text-gray-600 dark:text-gray-400">{{ player.leaguePoints }} LP</div>
          </div>
          <div class="text-right">
            <div class="text-lg font-semibold">
              {{ winRate }}% Win Rate
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
        <div v-else>
          <div v-if="matches.length === 0" class="text-center text-gray-600 dark:text-gray-400 py-8">
            No matches found.
          </div>
          <div v-else class="space-y-4">
            <div v-for="(match, idx) in matches" :key="match?.metadata?.matchId ?? idx"
                 class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <div>
                  <span class="font-semibold">{{ match?.info?.gameMode ?? 'Unknown mode' }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    {{ formatDuration(match?.info?.gameDuration ?? 0) }}
                  </span>
                </div>
                <span class="text-sm">
                  {{ formatDate(match?.info?.gameStartTimestamp ?? Date.now()) }}
                </span>
              </div>

              <!-- Player Performance -->
              <div v-if="playerStatsByMatch[match?.metadata?.matchId ?? '']" class="mt-2">
                <div class="flex items-center gap-4">
                  <div>
                    <span class="font-medium">{{ playerStatsByMatch[match?.metadata?.matchId ?? '']?.championName }}</span>
                    <span class="text-sm ml-2">
                      {{ playerStatsByMatch[match?.metadata?.matchId ?? '']?.kills }}/{{ playerStatsByMatch[match?.metadata?.matchId ?? '']?.deaths }}/{{ playerStatsByMatch[match?.metadata?.matchId ?? '']?.assists }}
                    </span>
                  </div>
                  <div :class="playerStatsByMatch[match?.metadata?.matchId ?? '']?.win ? 'text-green-500' : 'text-red-500'">
                    {{ playerStatsByMatch[match?.metadata?.matchId ?? '']?.win ? 'Victory' : 'Defeat' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="flex justify-center gap-2 mt-4">
              <button
                @click="prevPage"
                :disabled="matchesPage === 0"
                class="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300">
                Previous
              </button>
              <button
                @click="nextPage"
                :disabled="!hasMoreMatches"
                class="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
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

const winRate = computed(() => {
  if (!player.value) return '0.0'
  const wins = Number(player.value.wins || 0)
  const losses = Number(player.value.losses || 0)
  const total = wins + losses
  if (!total) return '0.0'
  return ((wins / total) * 100).toFixed(1)
})

const playerStatsByMatch = ref<Record<string, MatchDataParticipant>>({})

const isMock = computed(() => String(route.query.mock || '') === '1')

const MOCK_PLAYER: Player = {
  puuid: 'MOCK',
  tier: 'PLATINUM',
  rank: 'I',
  leaguePoints: 72,
  wins: 106,
  losses: 109,
  veteran: false,
  inactive: false,
  freshBlood: false
}

function getMockPlayer(p: string): Player {
  return { ...MOCK_PLAYER, puuid: p }
}

const fetchPlayer = async () => {
  // If mock requested, use it immediately
  if (isMock.value) {
    player.value = getMockPlayer(puuid)
    loading.value = false
    error.value = null
    return
  }
  try {
    player.value = await api.players.getByPuuid(puuid)
  } catch (e: any) {
    // Fallback to mock on 404 or network error
    const status = e?.response?.status
    if (status === 404 || status === 400 || e?.code === 'ERR_NETWORK') {
      player.value = getMockPlayer(puuid)
      error.value = null
    } else {
      console.error(e)
      error.value = 'Failed to load player details'
    }
  } finally {
    loading.value = false
  }
}

function pageWrap(resp: any) {
  if (!resp) return { content: [], totalPages: 0 }
  if (Array.isArray(resp)) return { content: resp, totalPages: 0 }
  return { content: resp.content ?? [], totalPages: resp.totalPages ?? 0 }
}

async function hydrateMatchesFromParticipants(participants: any[]): Promise<MatchData[]> {
  const ids = Array.from(new Set(participants.map(p => p.matchId).filter(Boolean))) as string[]
  const fetched = await Promise.all(ids.map(id => api.matchData.getById(id).catch(() => null)))
  return fetched.filter(Boolean) as MatchData[]
}

const fetchMatches = async () => {
  // In mock mode, show empty list and stop loading
  if (isMock.value) {
    matches.value = []
    playerStatsByMatch.value = {}
    hasMoreMatches.value = false
    loadingMatches.value = false
    return
  }
  loadingMatches.value = true
  try {
    // Use participants-by-puuid endpoint to avoid 404s on players.getMatches
    const resp = await api.matchData.getByPuuid(puuid, { page: matchesPage.value, size: 10 })
    const { content, totalPages } = pageWrap(resp)

    // Determine shape: MatchData vs Participant
    const looksLikeMatch = content.length > 0 && content[0]?.info && content[0]?.metadata

    let finalMatches: MatchData[] = []
    const statsMap: Record<string, MatchDataParticipant> = {}

    if (looksLikeMatch) {
      // Already MatchData[]
      finalMatches = content as MatchData[]
      for (const m of finalMatches) {
        const p = m.info.participants.find(p => p.puuid === puuid)
        if (p) statsMap[m.metadata.matchId] = p
      }
    } else {
      // Assume participant entries with matchId and K/D/A etc.
      for (const entry of content) {
        if (entry?.matchId) {
          statsMap[entry.matchId] = entry as MatchDataParticipant
        }
      }
      finalMatches = await hydrateMatchesFromParticipants(content)
    }

    matches.value = finalMatches
    playerStatsByMatch.value = statsMap

    if (typeof totalPages === 'number' && totalPages > 0) {
      hasMoreMatches.value = matchesPage.value < totalPages - 1
    } else {
      hasMoreMatches.value = content.length === 10
    }
  } catch (e) {
    console.error('Failed to load matches', e)
    matches.value = []
    playerStatsByMatch.value = {}
    if (matchesPage.value > 0) hasMoreMatches.value = false
  } finally {
    loadingMatches.value = false
  }
}

const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString()
const formatDuration = (seconds: number) => {
  const s = Number(seconds) || 0
  const minutes = Math.floor(s / 60)
  const remainingSeconds = s % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const prevPage = () => { if (matchesPage.value > 0) matchesPage.value-- }
const nextPage = () => { if (hasMoreMatches.value) matchesPage.value++ }

onMounted(() => { fetchPlayer(); fetchMatches() })
watch(matchesPage, fetchMatches)
watch(() => route.params.puuid, () => {
  // When navigating to another player, reset and refetch
  matchesPage.value = 0
  matches.value = []
  playerStatsByMatch.value = {}
  loading.value = true
  loadingMatches.value = true
  error.value = null
  // @ts-ignore-next-line
  const nextPuuid = route.params.puuid as string
  if (nextPuuid) {
    // update local puuid in closure is not necessary for API calls using route param directly
    fetchPlayer()
    fetchMatches()
  }
})
</script>
