<template>
  <div>
    <!-- Modern Dashboard Header -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 py-12 mb-6">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold text-white mb-2">Riot Stats Dashboard</h1>
        <p class="text-blue-100">Comprehensive League of Legends match analytics</p>

        <!-- API Health Status -->
        <div class="mt-6 flex items-center">
          <div :class="isApiHealthy ? 'bg-green-500' : 'bg-red-500'" class="h-3 w-3 rounded-full mr-2"></div>
          <span class="text-sm text-white">API Status: {{ isApiHealthy ? 'Online' : 'Offline' }}</span>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 pb-8">
      <!-- Statistics Summary Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div v-for="(stat, index) in summaryStats" :key="index"
             class="bg-white rounded-lg shadow-lg p-6 flex items-center border-l-4"
             :class="stat.colorClass">
          <div class="rounded-full p-3 mr-4" :class="stat.bgClass">
            <component :is="stat.icon" class="h-6 w-6" :class="stat.iconColor" />
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ stat.title }}</p>
            <p class="text-xl font-bold">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Match Duration Stats Card -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800">Match Duration</h2>
            <button @click="refreshMatchDuration" class="text-blue-600 hover:text-blue-800" aria-label="Refresh match duration">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <MatchDuration :duration-stats="durationStats" :is-loading="isLoadingDuration" />
        </div>

        <!-- Rank Distribution Card -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800">Rank Distribution</h2>
          </div>
          <div class="h-64">
            <RankDistribution />
          </div>
        </div>

        <!-- Top Champions Card -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800">Most Played Champions</h2>
            <button @click="refreshChampions" class="text-blue-600 hover:text-blue-800" aria-label="Refresh champions">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <TopChampions :champions="topChampions" :is-loading="isLoadingChampions" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Champion Winrates -->
        <div class="lg:col-span-2">
          <ChampionWinrates :winrates="championWinrates" :is-loading="isLoadingWinrates" />
        </div>

        <!-- Recent Matches -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800">Recent Matches</h2>
            <button @click="refreshRecentMatches" class="text-blue-600 hover:text-blue-800" aria-label="Refresh recent matches">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <RecentMatches :matches="recentMatches" :is-loading="isLoadingMatches" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

// API service
const api = useApi()

// API health
const isApiHealthy = ref(true)

// Summary stats
const summaryStats = ref([
  { title: 'Total Matches', value: '—', icon: 'svg-icon', colorClass: 'border-blue-500', bgClass: 'bg-blue-100', iconColor: 'text-blue-600' },
  { title: 'Players Tracked', value: '—', icon: 'svg-icon', colorClass: 'border-purple-500', bgClass: 'bg-purple-100', iconColor: 'text-purple-600' },
  { title: 'Avg. Match Duration', value: '—', icon: 'svg-icon', colorClass: 'border-green-500', bgClass: 'bg-green-100', iconColor: 'text-green-600' },
  { title: 'Top Tier', value: '—', icon: 'svg-icon', colorClass: 'border-yellow-500', bgClass: 'bg-yellow-100', iconColor: 'text-yellow-600' }
])

// Match duration state
const isLoadingDuration = ref(true)
const durationStats = ref<{ min: number; max: number; avg: number }>({ min: 0, max: 0, avg: 0 })

// Champions
const isLoadingChampions = ref(true)
const topChampions = ref<any[]>([])

// Winrates
const isLoadingWinrates = ref(true)
const championWinrates = ref<any[]>([])

// Recent matches
const isLoadingMatches = ref(true)
const recentMatches = ref<any[]>([])

const checkApiHealth = async () => {
  try {
    await api.healthCheck()
    isApiHealthy.value = true
  } catch {
    isApiHealthy.value = false
  }
}

const refreshMatchDuration = async () => {
  isLoadingDuration.value = true
  try {
    const stats = await api.matchData.stats.durations()
    // Ensure numeric fallbacks
    durationStats.value = {
      min: Number(stats?.min || 0),
      max: Number(stats?.max || 0),
      avg: Number(stats?.avg || 0)
    }
    if (stats?.avg) summaryStats.value[2].value = `${Math.round(stats.avg / 60)} min`
  } catch (e) {
    // keep defaults
  } finally {
    isLoadingDuration.value = false
  }
}

const refreshChampions = async () => {
  isLoadingChampions.value = true
  try {
    topChampions.value = await api.matchData.stats.champions({ byTeam: false, limit: 10 })
  } catch {
    topChampions.value = []
  } finally {
    isLoadingChampions.value = false
  }
}

const refreshWinrates = async () => {
  isLoadingWinrates.value = true
  try {
    const winrates = await api.matchData.stats.winrateByChampion()
    championWinrates.value = (winrates || []).sort((a: any, b: any) => b.winrate - a.winrate).slice(0, 10)
  } catch {
    championWinrates.value = []
  } finally {
    isLoadingWinrates.value = false
  }
}

const refreshRecentMatches = async () => {
  isLoadingMatches.value = true
  try {
    const page = await api.matchData.list({ page: 0, size: 5, sort: 'info.gameEndTimestamp,desc' })
    recentMatches.value = page?.content || []
    // Update total matches summary if provided
    if (typeof page?.totalElements === 'number') summaryStats.value[0].value = page.totalElements.toLocaleString()
  } catch {
    recentMatches.value = []
  } finally {
    isLoadingMatches.value = false
  }
}

const loadPlayerCount = async () => {
  try {
    const res = await api.players.stats.count()
    if (typeof res?.count === 'number') summaryStats.value[1].value = res.count.toLocaleString()
  } catch {}
}

onMounted(async () => {
  checkApiHealth()
  await Promise.all([
    refreshMatchDuration(),
    refreshChampions(),
    refreshWinrates(),
    refreshRecentMatches(),
    loadPlayerCount()
  ])
})
</script>
