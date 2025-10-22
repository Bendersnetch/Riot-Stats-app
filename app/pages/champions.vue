<template>
  <div class="container mx-auto p-4">
    <div class="grid gap-6">
      <!-- Statistics Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">Top Picked Champions</h2>
          <div class="h-[300px]">
            <div v-if="loadingPicks" class="flex items-center justify-center h-full">
              <Loading />
            </div>
            <div v-else>
              <PieChart
                :data="pickRateChartData"
                :options="chartOptions"
              />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">Top Winrate Champions</h2>
          <div class="h-[300px]">
            <div v-if="loadingWinrates" class="flex items-center justify-center h-full">
              <Loading />
            </div>
            <div v-else>
              <BarChart
                :data="winrateChartData"
                :options="chartOptions"
              />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">Team-Based Stats</h2>
          <div class="h-[300px]">
            <div v-if="loadingTeamStats" class="flex items-center justify-center h-full">
              <Loading />
            </div>
            <div v-else>
              <BarChart
                :data="teamStatsChartData"
                :options="chartOptions"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Champions Table -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Champion Statistics</h2>
          <div class="flex gap-2">
            <select v-model="sortBy" class="rounded border p-2">
              <option value="games">Games Played</option>
              <option value="winrate">Win Rate</option>
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
              <tr v-for="champion in sortedChampions" :key="champion.championId"
                class="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="py-2">{{ champion.championId }}</td>
                <td class="py-2 text-right">{{ champion.games }}</td>
                <td class="py-2 text-right">{{ champion.wins }}</td>
                <td class="py-2 text-right">{{ (champion.winrate).toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const api = useApi()
const loadingPicks = ref(true)
const loadingWinrates = ref(true)
const loadingTeamStats = ref(true)
const sortBy = ref<'games' | 'winrate'>('games')

const championPicks = ref<{ championId: number; count: number }[]>([])
const championWinrates = ref<{ championId: number; games: number; wins: number; winrate: number }[]>([])
const teamStats = ref<{ championId: number; count: number }[]>([])

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
  labels: championPicks.value.map(c => `Champion ${c.championId}`),
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
  labels: championWinrates.value.slice(0, 10).map(c => `Champion ${c.championId}`),
  datasets: [{
    label: 'Win Rate %',
    data: championWinrates.value.slice(0, 10).map(c => c.winrate),
    backgroundColor: 'rgba(75, 192, 192, 0.6)',
  }]
}))

const teamStatsChartData = computed(() => ({
  labels: teamStats.value.map(c => `Champion ${c.championId}`),
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

onMounted(() => {
  fetchPickRates()
  fetchWinrates()
  fetchTeamStats()
})
</script>
