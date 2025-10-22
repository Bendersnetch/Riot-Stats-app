<template>
  <div class="container mx-auto p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Match Duration Stats Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 class="text-xl font-bold mb-4">Match Duration Statistics</h2>
        <MatchDuration />
      </div>

      <!-- Rank Distribution Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 class="text-xl font-bold mb-4">Rank Distribution</h2>
        <div class="h-64">
          <RankDistribution />
        </div>
      </div>

      <!-- Top Champions Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 class="text-xl font-bold mb-4">Most Played Champions</h2>
        <TopChampions />
      </div>

      <!-- Champion Winrates -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 class="text-xl font-bold mb-4">Champion Winrates</h2>
        <ChampionWinrates />
      </div>

      <!-- Recent Matches -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 col-span-2">
        <h2 class="text-xl font-bold mb-4">Recent Matches</h2>
        <RecentMatches />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Components will be implemented next
</script>
