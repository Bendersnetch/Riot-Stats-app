<script setup lang="ts">
  const data = [
    {champion_id: 55,lane: "top",picks: 154416,wins: 75454},
    {champion_id: 58,lane: "mid",picks: 139158,wins: 65454},
    {champion_id: 8,lane: "adc",picks: 115965,wins: 55454},
    {champion_id: 92,lane: "sup",picks: 95959,wins: 27545},
    {champion_id: 125,lane: "jng",picks: 82828,wins: 7544},
  ]

  const categories = {
    picks: {
      name: 'Picks',
      color: '#51a2ff'
    },
    wins: {
      name: 'Wins',
      color: '#22c55e'
    }
  }

  const xFormatter = (i: number) => data[i]?.champion_id
  const yFormatter = (tick: number, _i?: number, _ticks?: number[]) => tick.toString()
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
        :data="data"
        :stacked="true"
        :height="300"
        :categories="categories"
        :y-axis="['picks', 'wins']"
        :group-padding="0"
        :bar-padding="0.2"
        :x-num-ticks="6"
        :radius="4"
        :x-formatter="xFormatter"
        :y-formatter="yFormatter"
        :legend-position="LegendPosition.Top"
        :hide-legend="false"
        :y-grid-line="true"
      />
    </div>
  </div>

</template>