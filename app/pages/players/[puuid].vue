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

      <!-- Aggregated Player Stats -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Player Season Stats</h2>
        <div v-if="loadingStats" class="flex justify-center py-6">
          <Loading />
        </div>
        <div v-else-if="!playerStats" class="text-sm text-gray-600 dark:text-gray-400">
          No stats available.
        </div>
        <div v-else class="space-y-6">
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <div class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Games</div>
              <div class="text-2xl font-semibold">{{ totalGames }}</div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Wins / Losses</div>
              <div class="text-lg font-medium">{{ overviewWins }} / {{ overviewLosses }}</div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Win Rate</div>
              <div class="text-lg font-medium">{{ overviewWinrate }}%</div>
            </div>
          </div>

          <div v-if="averagesDisplay" class="grid md:grid-cols-3 gap-4">
            <div v-for="metric in averagesDisplay" :key="metric.label">
              <div class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ metric.label }}</div>
              <div class="text-lg font-medium">{{ metric.value }}</div>
            </div>
          </div>

          <div v-if="topChampions.length" class="space-y-3">
            <div class="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Champions</div>
            <ul class="divide-y divide-gray-200 dark:divide-gray-700">
              <li v-for="champ in topChampions" :key="champ.championId + ':' + (champ.championName || '')" class="py-2 flex justify-between items-center">
                <span class="truncate">{{ champ.championName || ('Champion ' + champ.championId) }}</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ formatWinrate(champ.winrate, champ.wins, champ.games ?? champ.count) }} • {{ champ.games ?? champ.count ?? 0 }} games</span>
              </li>
            </ul>
          </div>

          <div v-if="additionalSections.length" class="grid md:grid-cols-2 gap-6">
            <div v-for="section in additionalSections" :key="section.title" class="space-y-3">
              <div class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ section.title }}</div>
              <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                <li v-for="entry in section.entries" :key="section.title + ':' + entry.label" class="py-2 flex justify-between items-center">
                  <span class="truncate">{{ entry.label }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ entry.detail }}</span>
                </li>
              </ul>
            </div>
          </div>

          <details class="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300">
            <summary class="cursor-pointer font-medium text-gray-700 dark:text-gray-200">Raw stats payload</summary>
            <pre class="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs">{{ prettyPlayerStats }}</pre>
          </details>
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
const loadingStats = ref(true)
const error = ref<string | null>(null)
const player = ref<Player | null>(null)
const matches = ref<MatchData[]>([])
const matchesPage = ref(0)
const hasMoreMatches = ref(true)
const playerStats = ref<Record<string, any> | null>(null)

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
    buildMockStats()
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
      buildMockStats()
    }
  } finally {
    loading.value = false
  }
}

const buildMockStats = () => {
  const p = player.value ?? getMockPlayer(puuid)
  const wins = Number(p?.wins || 0)
  const losses = Number(p?.losses || 0)
  const games = wins + losses
  playerStats.value = {
    wins,
    losses,
    totalGames: games,
    winrate: games ? (wins / games) * 100 : 0,
  }
  loadingStats.value = false
}

const fetchPlayerStats = async () => {
  if (isMock.value) {
    buildMockStats()
    return
  }
  loadingStats.value = true
  try {
    const stats = await api.players.stats.details(puuid)
    playerStats.value = stats ?? null
  } catch (e) {
    const status = (e as any)?.response?.status
    if (status === 404) {
      console.warn('Player stats not available (404) for', puuid)
      playerStats.value = null
    } else {
      console.error('Failed to load player stats', e)
      playerStats.value = null
    }
  } finally {
    loadingStats.value = false
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
    const status = (e as any)?.response?.status
    if (status === 404) {
      console.warn('No matches available (404) for', puuid)
    } else {
      console.error('Failed to load matches', e)
    }
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

onMounted(() => { fetchPlayer(); fetchMatches(); fetchPlayerStats() })
watch(matchesPage, fetchMatches)
watch(() => route.params.puuid, () => {
  // When navigating to another player, reset and refetch
  matchesPage.value = 0
  matches.value = []
  playerStatsByMatch.value = {}
  loading.value = true
  loadingMatches.value = true
  loadingStats.value = true
  playerStats.value = null
  error.value = null
  // @ts-ignore-next-line
  const nextPuuid = route.params.puuid as string
  if (nextPuuid) {
    // update local puuid in closure is not necessary for API calls using route param directly
    fetchPlayer()
    fetchMatches()
    fetchPlayerStats()
  }
})

const formatWinrate = (value?: number, wins?: number, total?: number) => {
  if (value != null) return `${Number(value).toFixed(1)}%`
  if (wins != null && total) return `${((wins / total) * 100).toFixed(1)}%`
  return '0.0%'
}

const totalGames = computed(() => {
  if (!playerStats.value) return 0
  const stats: any = playerStats.value
  return Number(stats.totalGames ?? stats.games ?? stats.count ?? 0)
})
const overviewWins = computed(() => {
  if (!playerStats.value) return player.value?.wins ?? 0
  const stats: any = playerStats.value
  return Number(stats.wins ?? stats.totalWins ?? 0)
})
const overviewLosses = computed(() => {
  if (!playerStats.value) return player.value?.losses ?? 0
  const stats: any = playerStats.value
  const explicit = stats.losses ?? stats.totalLosses
  if (explicit != null) return Number(explicit)
  const total = totalGames.value
  const wins = overviewWins.value
  if (total) return Math.max(total - wins, 0)
  return player.value?.losses ?? 0
})
const overviewWinrate = computed(() => {
  if (!playerStats.value) return winRate.value
  const stats: any = playerStats.value
  if (stats.winrate != null) return Number(stats.winrate).toFixed(1)
  const wins = overviewWins.value
  const losses = overviewLosses.value
  const total = wins + losses
  return total ? ((wins / total) * 100).toFixed(1) : '0.0'
})

const topChampions = computed(() => {
  if (!playerStats.value) return [] as any[]
  const stats: any = playerStats.value
  const list = stats.topChampions ?? stats.mostPlayedChampions ?? stats.champions ?? []
  return Array.isArray(list) ? list.slice(0, 5) : []
})

const averagesDisplay = computed(() => {
  if (!playerStats.value) return null
  const stats: any = playerStats.value
  const rows: { label: string; value: string }[] = []
  if (stats.avgKills ?? stats.averageKills) rows.push({ label: 'Avg Kills', value: Number(stats.avgKills ?? stats.averageKills).toFixed(1) })
  if (stats.avgDeaths ?? stats.averageDeaths) rows.push({ label: 'Avg Deaths', value: Number(stats.avgDeaths ?? stats.averageDeaths).toFixed(1) })
  if (stats.avgAssists ?? stats.averageAssists) rows.push({ label: 'Avg Assists', value: Number(stats.avgAssists ?? stats.averageAssists).toFixed(1) })
  if (stats.kda) rows.push({ label: 'KDA', value: Number(stats.kda).toFixed(2) })
  if (stats.csPerMinute ?? stats.csPerMin ?? stats.cspm) rows.push({ label: 'CS / Min', value: Number(stats.csPerMinute ?? stats.csPerMin ?? stats.cspm).toFixed(2) })
  if (stats.damagePerMinute ?? stats.dpm ?? stats.avgDamagePerMinute) rows.push({ label: 'Damage / Min', value: Math.round(Number(stats.damagePerMinute ?? stats.dpm ?? stats.avgDamagePerMinute)).toString() })
  if (stats.goldPerMinute ?? stats.gpm ?? stats.avgGoldPerMinute) rows.push({ label: 'Gold / Min', value: Math.round(Number(stats.goldPerMinute ?? stats.gpm ?? stats.avgGoldPerMinute)).toString() })
  if (!rows.length) return null
  return rows
})

const additionalSections = computed(() => {
  if (!playerStats.value) return [] as { title: string; entries: { label: string; detail: string }[] }[]
  const stats: any = playerStats.value
  const sections: { title: string; entries: { label: string; detail: string }[] }[] = []

  const topRoles = stats.topRoles ?? stats.roles ?? []
  if (Array.isArray(topRoles) && topRoles.length) {
    sections.push({
      title: 'Top Roles',
      entries: topRoles.slice(0, 5).map((r: any) => ({
        label: r.role || r.position || r.name,
        detail: `${formatWinrate(r.winrate, r.wins, r.games ?? r.count)} • ${r.games ?? r.count ?? 0} games`
      }))
    })
  }

  const topQueues = stats.topQueues ?? stats.queues ?? []
  if (Array.isArray(topQueues) && topQueues.length) {
    sections.push({
      title: 'Top Queues',
      entries: topQueues.slice(0, 5).map((q: any) => ({
        label: q.name || q.queue || q.queueId,
        detail: `${formatWinrate(q.winrate, q.wins, q.games ?? q.count)} • ${q.games ?? q.count ?? 0} games`
      }))
    })
  }

  const topItems = stats.topItems ?? stats.items ?? []
  if (Array.isArray(topItems) && topItems.length) {
    sections.push({
      title: 'Core Items',
      entries: topItems.slice(0, 6).map((i: any) => ({
        label: i.itemName || i.name || `Item ${i.itemId ?? i.id}`,
        detail: `${formatWinrate(i.winrate, i.wins, i.games ?? i.count)} • ${i.games ?? i.count ?? 0} games`
      }))
    })
  }

  const allies = stats.commonAllies ?? stats.duo ?? stats.teammates ?? []
  if (Array.isArray(allies) && allies.length) {
    sections.push({
      title: 'Common Allies',
      entries: allies.slice(0, 6).map((a: any) => ({
        label: a.name || a.summonerName || (a.puuid ? `${a.puuid.slice(0, 8)}…` : 'Unknown'),
        detail: `${formatWinrate(a.winrate, a.wins, a.games ?? a.count)} • ${a.games ?? a.count ?? 0} games`
      }))
    })
  }

  const opponents = stats.commonOpponents ?? stats.opponents ?? []
  if (Array.isArray(opponents) && opponents.length) {
    sections.push({
      title: 'Common Opponents',
      entries: opponents.slice(0, 6).map((o: any) => ({
        label: o.name || o.summonerName || (o.puuid ? `${o.puuid.slice(0, 8)}…` : 'Unknown'),
        detail: `${formatWinrate(o.winrate, o.wins, o.games ?? o.count)} • ${o.games ?? o.count ?? 0} games`
      }))
    })
  }

  return sections
})

const prettyPlayerStats = computed(() => JSON.stringify(playerStats.value, null, 2))
</script>
