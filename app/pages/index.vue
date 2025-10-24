<template>
  <div>
    <!-- Modern Dashboard Header -->
    <div class="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 py-12 mb-6">
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div v-for="(stat, index) in summaryStats" :key="index"
             class="dashboard-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-center border-l-4 transition-colors"
             :class="stat.colorClass">
          <div class="rounded-full p-3 mr-4" :class="stat.bgClass">
            <component :is="stat.icon" class="h-6 w-6" :class="stat.iconColor" />
          </div>
          <div>
            <p class="text-sm card-subtitle">{{ stat.title }}</p>
            <p class="text-xl font-bold">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Match Duration Stats Card -->
        <div class="dashboard-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold card-title">Match Duration</h2>
            <button @click="refreshMatchDuration" class="text-blue-600 hover:text-blue-800" aria-label="Refresh match duration">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <MatchDuration :duration-stats="durationStats" :is-loading="isLoadingDuration" />
        </div>

        <!-- Top Champions Card -->
        <div class="dashboard-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold card-title">Most Played Champions</h2>
            <button @click="refreshChampions" class="text-blue-600 hover:text-blue-800" aria-label="Refresh champions">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <TopChampions :champions="topChampions" :is-loading="isLoadingChampions" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        <!-- Champion Winrates -->
        <div class="lg:col-span-2">
<!--          <ChampionWinrates :winrates="championWinrates" :is-loading="isLoadingWinrates" />-->
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
    // Use existing health endpoint from matchIds
    await api.matchIds.health()
    isApiHealthy.value = true
  } catch {
    isApiHealthy.value = false
  }
}

const refreshMatchDuration = async () => {
  isLoadingDuration.value = true
  try {
    const raw: any = await api.matchData.stats.durations()
    const { min = 0, max = 0, avg = 0 } = (raw || {}) as { min?: number; max?: number; avg?: number }
    durationStats.value = { min: Number(min) || 0, max: Number(max) || 0, avg: Number(avg) || 0 }
    if (durationStats.value.avg && summaryStats.value[2]) {
      summaryStats.value[2].value = `${Math.round(durationStats.value.avg / 60)} min`
    }
  } catch {
    // keep defaults
  } finally {
    isLoadingDuration.value = false
  }
}

const refreshChampions = async () => {
  isLoadingChampions.value = true
  try {
    topChampions.value = (await api.matchData.stats.champions({ byTeam: false, limit: 10 })) as any[]
  } catch {
    topChampions.value = []
  } finally {
    console.log(topChampions.value)
    isLoadingChampions.value = false
  }
}

const refreshWinrates = async () => {
  isLoadingWinrates.value = true
  try {
    const winrates = (await api.matchData.stats.winrateByChampion()) as any[]
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
    const page: any = (await api.matchData.list({ page: 0, size: 5, sort: 'info.gameEndTimestamp,desc' })) ?? {}
    recentMatches.value = Array.isArray(page?.content) ? page.content : []
    const total = typeof page?.totalElements === 'number' ? page.totalElements : undefined
    if (typeof total === 'number' && summaryStats.value[0]) {
      summaryStats.value[0].value = total.toLocaleString()
    }
  } catch {
    recentMatches.value = []
  } finally {
    isLoadingMatches.value = false
  }
}

const loadPlayerCount = async () => {
  try {
    const res: any = await api.players.stats.count()
    const count = res && typeof res.count === 'number' ? res.count : undefined
    if (typeof count === 'number' && summaryStats.value[1]) summaryStats.value[1].value = count.toLocaleString()
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
