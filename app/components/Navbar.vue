<template>
  <nav class="bg-white dark:bg-gray-800 shadow">
    <div class="container mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex">
          <NuxtLink to="/" class="flex items-center">
            <span class="text-xl font-bold">Riot Stats</span>
          </NuxtLink>

          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <NuxtLink
              to="/"
              class="inline-flex items-center px-1 pt-1 border-b-2"
              :class="[
                $route.path === '/'
                  ? 'border-blue-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400'
              ]">
              Dashboard
            </NuxtLink>

            <NuxtLink
              to="/players"
              class="inline-flex items-center px-1 pt-1 border-b-2"
              :class="[
                $route.path.startsWith('/players')
                  ? 'border-blue-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400'
              ]">
              Players
            </NuxtLink>

            <NuxtLink
              to="/champions"
              class="inline-flex items-center px-1 pt-1 border-b-2"
              :class="[
                $route.path === '/champions'
                  ? 'border-blue-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400'
              ]">
              Champions
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Component is fully template-driven
</script>
