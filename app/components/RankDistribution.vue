<template>
  <div class="h-full">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <Loading />
    </div>
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>
    <div v-else class="h-full">
      <BarChart
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '~/composables/useApi'

const api = useApi()
const loading = ref(true)
const error = ref<string | null>(null)
const distribution = ref<any[]>([])

const fetchData = async () => {
  try {
    const data = await api.players.stats.distribution()
    distribution.value = data
  } catch (e) {
    error.value = 'Failed to load rank distribution'
  } finally {
    loading.value = false
  }
}

const chartData = computed(() => ({
  labels: distribution.value.map(d => `${d.id.tier} ${d.id.rank}`),
  datasets: [{
    label: 'Players',
    data: distribution.value.map(d => d.count),
    backgroundColor: 'rgba(75, 192, 192, 0.6)',
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    },
    title: {
      display: true,
      text: 'Rank Distribution'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Players'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Rank'
      }
    }
  }
}

onMounted(fetchData)
</script>
