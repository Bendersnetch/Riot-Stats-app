<template>
  <nav class="bg-white dark:bg-gray-800 shadow transition-colors duration-300">
    <div class="container mx-auto px-4 py-4">
      <div class="flex flex-col gap-4">
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center">
            <span class="text-xl font-bold">Riot Stats</span>
          </NuxtLink>
        </div>

        <div class="flex flex-col space-y-2">
          <NuxtLink
            to="/"
            class="inline-flex items-center px-2 py-2 border-l-4 rounded"
            :class="[
              $route.path === '/'
                ? 'border-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/40'
            ]">
            Dashboard
          </NuxtLink>

          <NuxtLink
            to="/players"
            class="inline-flex items-center px-2 py-2 border-l-4 rounded"
            :class="[
              $route.path.startsWith('/players')
                ? 'border-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/40'
            ]">
            Players
          </NuxtLink>

          <NuxtLink
            to="/champions"
            class="inline-flex items-center px-2 py-2 border-l-4 rounded"
            :class="[
              $route.path === '/champions'
                ? 'border-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/40'
            ]">
            Champions
          </NuxtLink>
        </div>

        <div>
          <!-- Compact Theme Toggle (light/dark only) -->
          <button
            class="p-2 rounded-md border text-sm flex items-center gap-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
            @click="toggleTheme"
            :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'">
            <Icon v-if="isDark" name="heroicons:moon" class="w-4 h-4" />
            <Icon v-else name="heroicons:sun" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useColorMode } from '#imports'

const colorMode = useColorMode()

// Effective mode may be light/dark even if preference is 'system'
const isDark = computed(() => colorMode.value === 'dark')

const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>
