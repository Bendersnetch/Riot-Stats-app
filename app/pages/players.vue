<script lang="ts" setup>
const RevenueData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
]

const RevenueCategories = computed(() => ({
  desktop: {
    name: 'Desktop',
    color: '#22c55e',
  },
}))

const xFormatter = (i: number): string => `${RevenueData[i]?.month}`
const yFormatter = (tick: number) => tick.toString()
</script>

<template>
  <div class="card">
    <div class="card-head">
      <div class="p-3">
        <span>This is a bar test</span>
      </div>
    </div>
    <div class="card-body">
      <BarChart
        :data="RevenueData"
        :height="300"
        :categories="RevenueCategories"
        :y-axis="['desktop']"
        :x-num-ticks="6"
        :radius="4"
        :y-grid-line="true"
        :x-formatter="xFormatter"
        :y-formatter="yFormatter"
        :legend-position="LegendPosition.Top"
        :hide-legend="false"
      />
    </div>
  </div>
</template>
