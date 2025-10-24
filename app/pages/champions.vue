<template>
  <div class="container mx-auto p-4">
    <div class="grid gap-6">
      <!-- Statistics Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col h-[400px]">
          <h2 class="text-xl font-bold mb-4">Top Picked Champions</h2>
          <div class="flex-1">
            <div v-if="loadingPicks" class="flex items-center justify-center h-full">
              <Loading />
            </div>
            <div v-else>
              <div class="h-[320px]">
                <BasePieChart
                  :data="pickRateChartData"
                  :options="chartOptions"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col h-[400px]">
          <h2 class="text-xl font-bold mb-4">Top Winrate Champions</h2>
          <div class="flex-1">
            <div v-if="loadingWinrates" class="flex items-center justify-center h-full">
              <Loading />
            </div>
            <div v-else class="h-full">
              <BaseBarChart
                :data="winrateChartData"
                :options="chartOptions"
              />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col h-[400px]">
          <h2 class="text-xl font-bold mb-4">Team-Based Stats</h2>
          <div class="flex-1">
            <div v-if="loadingTeamStats" class="flex items-center justify-center h-full">
              <Loading />
            </div>
            <div v-else class="h-full">
              <BaseBarChart
                :data="teamStatsChartData"
                :options="chartOptions"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Champions Table -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <h2 class="text-xl font-bold">Champion Statistics</h2>
          <div class="flex gap-2 items-center">
            <label class="text-sm text-gray-600">Sort by</label>
            <select v-model="sortBy" class="rounded border p-2 bg-gray-900">
              <option value="games">Games Played</option>
              <option value="winrate">Win Rate</option>
            </select>

            <label class="ml-4 text-sm text-gray-600">Page size</label>
            <select v-model.number="tableSize" class="rounded border p-2 bg-gray-900">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="py-2 text-left">Champion</th>
                <th class="py-2 text-right">Games</th>
                <th class="py-2 text-right">Wins</th>
                <th class="py-2 text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="champion in paginatedChampions" :key="champion.championId"
                class="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="py-2">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="champion.championName"
                      :src="`/tiles/${champion.championName}_0.jpg`"
                      :alt="champion.championName"
                      class="w-6 h-6 rounded object-cover"
                      @error="($event.target as HTMLImageElement).style.display='none'"
                    />
                    <span>{{ champion.championName || `Champion ${champion.championId}` }}</span>
                  </div>
                </td>
                <td class="py-2 text-right">{{ champion.games }}</td>
                <td class="py-2 text-right">{{ champion.wins }}</td>
                <td class="py-2 text-right">{{ (champion.winrate).toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex items-center justify-center gap-3 mt-4">
          <button
            @click="prevTablePage"
            :disabled="tablePage === 0"
            class="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300">
            Previous
          </button>
          <div class="text-sm text-gray-600">Page {{ tablePage + 1 }} / {{ tableTotalPages }}</div>
          <button
            @click="nextTablePage"
            :disabled="tablePage >= tableTotalPages - 1"
            class="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import BasePieChart from '~/components/BasePieChart.vue'
import BaseBarChart from '~/components/BaseBarChart.vue'

// Local type for winrate items from API including championName
type ChampionWinrateItem = { championId: number; championName?: string; games: number; wins: number; winrate: number }

const api = useApi()
const loadingPicks = ref(true)
const loadingWinrates = ref(true)
const loadingTeamStats = ref(true)
const sortBy = ref<'games' | 'winrate'>('games')

// Include optional championName for charts
const championPicks = ref<{ championId: number; championName?: string; count: number }[]>([])
const championWinrates = ref<ChampionWinrateItem[]>([])
const teamStats = ref<{ championId: number; championName?: string; count: number }[]>([])

// Build a map championId -> championName from winrate endpoint (which includes names)
const idToChampionName = computed(() => {
  const map = new Map<number, string>()
  for (const c of championWinrates.value) {
    if (c.championName) map.set(c.championId, c.championName)
  }
  return map
})

// Fetch data functions
const fetchPickRates = async () => {
  try {
    championPicks.value = await api.matchData.stats.champions({ limit: 10 })
  } catch (e) {
    console.error('Failed to load pick rates')
  } finally {
    loadingPicks.value = false
  }
}

const fetchWinrates = async () => {
  try {
    championWinrates.value = await api.matchData.stats.winrateByChampion()
  } catch (e) {
    console.error('Failed to load winrates')
  } finally {
    loadingWinrates.value = false
  }
}

const fetchTeamStats = async () => {
  try {
    teamStats.value = await api.matchData.stats.champions({ byTeam: true, limit: 10 })
  } catch (e) {
    console.error('Failed to load team stats')
  } finally {
    loadingTeamStats.value = false
  }
}

// Chart data computeds
const pickRateChartData = computed(() => ({
  labels: championPicks.value.map(c => idToChampionName.value.get(c.championId) || c.championName || `Champion ${c.championId}`),
  datasets: [{
    label: 'Pick Rate',
    data: championPicks.value.map(c => c.count),
    backgroundColor: [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
    ],
  }]
}))

const winrateChartData = computed(() => ({
  labels: championWinrates.value.slice(0, 10).map(c => c.championName || `Champion ${c.championId}`),
  datasets: [{
    label: 'Win Rate %',
    data: championWinrates.value.slice(0, 10).map(c => c.winrate),
    backgroundColor: 'rgba(75, 192, 192, 0.6)',
  }]
}))

const teamStatsChartData = computed(() => ({
  labels: teamStats.value.map(c => idToChampionName.value.get(c.championId) || c.championName || `Champion ${c.championId}`),
  datasets: [{
    label: 'Team Pick Rate',
    data: teamStats.value.map(c => c.count),
    backgroundColor: 'rgba(153, 102, 255, 0.6)',
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}

const sortedChampions = computed(() => {
  return [...championWinrates.value].sort((a, b) => {
    if (sortBy.value === 'games') {
      return b.games - a.games
    }
    return b.winrate - a.winrate
  })
})

// Client-side pagination for champions table
const tablePage = ref(0)
const tableSize = ref(10)
const tableTotalPages = computed(() => {
  const total = sortedChampions.value.length
  return total === 0 ? 1 : Math.ceil(total / tableSize.value)
})
const paginatedChampions = computed(() => {
  const start = tablePage.value * tableSize.value
  const end = start + tableSize.value
  return sortedChampions.value.slice(start, end)
})

const prevTablePage = () => {
  if (tablePage.value > 0) tablePage.value--
}
const nextTablePage = () => {
  if (tablePage.value < tableTotalPages.value - 1) tablePage.value++
}

// Reset to first page when sort or data changes
watch([sortBy, championWinrates, tableSize], () => {
  tablePage.value = 0
})

onMounted(() => {
  fetchPickRates()
  fetchWinrates()
  fetchTeamStats()
})
</script>
