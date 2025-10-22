<template>
  <div class="h-full">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <Loading />
    </div>
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>
    <div v-else>
      <ul class="divide-y">
        <li v-for="champion in champions" :key="champion.championId" class="py-2 flex justify-between">
          <span>{{ champion.championId }}</span>
          <span class="text-gray-600 dark:text-gray-400">{{ champion.count }} games</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const api = useApi()
const loading = ref(true)
const error = ref<string | null>(null)
const champions = ref<{ championId: number; count: number }[]>([])

const fetchData = async () => {
  try {
    const data = await api.matchData.stats.champions({ limit: 10 })
    champions.value = data
  } catch (e) {
    error.value = 'Failed to load champion statistics'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
