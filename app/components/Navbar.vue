<template>
  <nav class="h-full flex flex-col bg-gray-900 text-gray-200">
    <!-- Top: Brand -->
    <div class="px-4 py-4 border-b border-gray-800">
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="text-lg font-semibold">Riot Stats</span>
      </NuxtLink>
    </div>

    <!-- Middle: Navigation -->
    <div class="flex-1 px-2 py-4 space-y-1">
      <NuxtLink
        to="/"
        class="block rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="[$route.path === '/' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800/60']"
      >
        Dashboard
      </NuxtLink>

      <NuxtLink
        to="/players"
        class="block rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="[$route.path.startsWith('/players') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800/60']"
      >
        Players
      </NuxtLink>

      <NuxtLink
        to="/champions"
        class="block rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="[$route.path === '/champions' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800/60']"
      >
        Champions
      </NuxtLink>
    </div>

    <!-- Bottom: Theme toggle removed for forced dark mode -->
  </nav>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark')
  }
})
</script>
