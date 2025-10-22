<template>
  <div class="container mx-auto p-4">
    <div class="mb-8">
      <div class="flex gap-4 items-center mb-4">
        <h1 class="text-2xl font-bold">Player Rankings</h1>
        <div class="flex gap-2">
          <select v-model="sortBy" class="rounded border p-2">
            <option value="lp">League Points</option>
            <option value="wins">Wins</option>
            <option value="winrate">Winrate</option>
          </select>
          <select v-model="selectedTier" class="rounded border p-2">
            <option value="">All Tiers</option>
            <option v-for="tier in tiers" :key="tier" :value="tier">{{ tier }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center my-8">
        <Loading />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-red-500 text-center my-8">
        {{ error }}
      </div>

      <!-- Players List -->
      <div v-else class="grid gap-4">
        <div v-for="player in players" :key="player.puuid"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div class="flex justify-between items-center">
            <div>
              <NuxtLink :to="`/players/${player.puuid}`" class="text-lg font-semibold hover:text-blue-500">
                {{ formatPuuid(player.puuid) }}
              </NuxtLink>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ player.tier }} {{ player.rank }} - {{ player.leaguePoints }} LP
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold">
                {{ ((player.wins / (player.wins + player.losses)) * 100).toFixed(1) }}% WR
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ player.wins }}W {{ player.losses }}L
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex justify-center gap-2 mt-4">
          <button
            @click="page--"
            :disabled="page === 0"
            class="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300">
            Previous
          </button>
          <button
            @click="page++"
            :disabled="page >= totalPages - 1"
            class="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Player, Tier } from '~/types/api'

const api = useApi()
const loading = ref(true)
const error = ref<string | null>(null)
const players = ref<Player[]>([])
const page = ref(0)
const totalPages = ref(0)
const sortBy = ref<'lp' | 'wins' | 'winrate'>('lp')
const selectedTier = ref('')
const tiers = ref<Tier[]>([])

const fetchPlayers = async () => {
  loading.value = true
  try {
    const { content, totalPages: total } = await api.players.stats.leaderboard({
      by: sortBy.value,
      tier: selectedTier.value || undefined,
      limit: 20
    })
    players.value = content
    totalPages.value = total
  } catch (e) {
    error.value = 'Failed to load players'
  } finally {
    loading.value = false
  }
}

const fetchTiers = async () => {
  try {
    const distinctTiers = await api.matchIds.stats.distinctTiers()
    tiers.value = distinctTiers
  } catch (e) {
    console.error('Failed to load tiers')
  }
}

const formatPuuid = (puuid: string) => {
  return puuid.slice(0, 8) + '...'
}

watch([sortBy, selectedTier, page], () => {
  fetchPlayers()
})

onMounted(() => {
  fetchTiers()
  fetchPlayers()
})
</script>
