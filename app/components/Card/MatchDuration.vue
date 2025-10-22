<script setup lang="ts">
  const {get} = useRequest()

  const durations = ref({})

  onMounted(() => {
    get('/api/match-data/stats/durations').then((response) => {

      console.log(response)
      durations.value.avg = response.avg 
      durations.value.min = response.min
      durations.value.max = response.max
    })
  })
</script>

<template>
  <div class="card">
    <div class="card-head">
        <div class="p-3">
          <span>Durée des matchs</span>
        </div>
      <div v-if="durations.hasOwnProperty('avg')" class="card-body">
        <div>
          <span>Le match la durée moyenne</span>
          {{ durations.avg }} minutes
        </div>
        <div>
          <span>Le match le plus court</span>
          {{ durations.min }} minutes
        </div>
        <div>
          <span>Le match le plus long</span>
          {{ durations.max }} minutes
        </div>
      </div>
      <div v-else class="card-body">
        <Loading></Loading>
      </div>
    </div>
  </div>
</template>