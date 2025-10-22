<template>
  <div class="relative h-full w-full">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { Chart, type ChartData, type ChartOptions } from 'chart.js/auto'

const props = defineProps<{
  data: ChartData,
  options?: ChartOptions
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const createChart = () => {
  if (!chartRef.value) return

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(chartRef.value, {
    type: 'bar',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...props.options,
      scales: {
        y: {
          beginAtZero: true,
          ...(props.options?.scales?.y || {})
        }
      }
    }
  })
}

watch(() => props.data, () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>
