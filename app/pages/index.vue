<script setup lang="ts">
import { cloneVNode } from 'vue';


  const {get} = useRequest();

  const result = ref();

  // variables for th different charts
  // player rank chart
  const rankValues = []
  const tierCategories = {}
  let xFormatterRankChart

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  const data = [
    { month: 'Jan', sales: 100, profit: 50 },
    { month: 'Feb', sales: 120, profit: 55 },
    { month: 'Mar', sales: 180, profit: 80 },
    { month: 'Apr', sales: 110, profit: 40 },
    { month: 'May', sales: 90, profit: 30 }
  ]

  const categories = {
    sales: {
      name: 'Sales',
      color: '#3b82f6'
    },
    profit: {
      name: 'Profit',
      color: '#10b981'
    }
  }

  const xFormatter = (i: number) => data[i].month

  onMounted(() => {

  })
</script>

<template>
  <div class="card">
    <div class="card-head">
      <div class="p-3">
        <span>This is a chart test</span>
      </div>
    </div>
    <div class="card-body">
      <LineChart
      :data="data"
      :categories="categories"
      :height="300"
      :xFormatter="xFormatter"
      xLabel="Month"
      yLabel="Amount"
      />
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <div class="p-3">
        <span>This is a chart test</span>
      </div>
    </div>
    <div class="card-body">
      <div class="text-3xl">request result</div>
      <div>{{ result }}</div>
    </div>
  </div>
</template>