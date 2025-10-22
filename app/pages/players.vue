<template>
  <div class="container mx-auto p-4">
    <div class="mb-8">
      <div class="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h1 class="text-2xl font-bold">Player Rankings</h1>
        <div class="flex gap-2 items-center">
          <label class="text-sm text-gray-600">Sort by</label>
          <select v-model="sortBy" class="rounded border p-2">
            <option value="leaguePoints">League Points</option>
            <option value="wins">Wins</option>
          </select>

          <label class="ml-4 text-sm text-gray-600">Tier</label>
          <select v-model="selectedTier" class="rounded border p-2 min-w-40">
            <option value="">All Tiers</option>
            <option v-for="tier in tiers" :key="tier" :value="tier">{{ tier }}</option>
          </select>

          <label class="ml-4 text-sm text-gray-600">Page size</label>
          <select v-model.number="size" class="rounded border p-2">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
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

        <!-- Pagination Controls -->
        <div class="flex items-center justify-center gap-3 mt-4">
          <button
            @click="prevPage"
            :disabled="page === 0"
            class="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300">
            Previous
          </button>
          <div class="text-sm text-gray-600">Page {{ page + 1 }} / {{ displayTotalPages }}</div>
          <button
            @click="nextPage"
            :disabled="page >= displayTotalPages - 1"
            class="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Player, Tier } from '~/types/api'

const api = useApi()
const loading = ref(true)
const error = ref<string | null>(null)
const players = ref<Player[]>([])
const page = ref(0)
const size = ref(20)
const totalPages = ref(0)
const sortBy = ref<'leaguePoints' | 'wins'>('leaguePoints')
const selectedTier = ref('')
const tiers = ref<Tier[]>([])

const displayTotalPages = computed(() => Math.max(totalPages.value, 1))

const fetchPlayers = async () => {
  loading.value = true
  try {
    const { content, totalPages: total } = await api.players.list({
      tier: selectedTier.value || undefined,
      page: page.value,
      size: size.value,
      sort: `${sortBy.value},desc`
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

const prevPage = () => {
  if (page.value > 0) page.value--
}
const nextPage = () => {
  if (page.value < totalPages.value - 1) page.value++
}

watch([sortBy, selectedTier, page, size], (newVals, oldVals) => {
  // If sort, tier or size changed (indices 0,1,3), reset to first page
  if (newVals[0] !== oldVals?.[0] || newVals[1] !== oldVals?.[1] || newVals[3] !== oldVals?.[3]) {
    page.value = 0
  }
  fetchPlayers()
})

onMounted(() => {
  fetchTiers()
  fetchPlayers()
})
</script>
