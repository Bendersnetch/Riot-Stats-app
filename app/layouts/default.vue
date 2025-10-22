<template>
  <div class="min-h-screen transition-colors duration-300">
    <div class="flex min-h-screen">
      <aside class="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700">
        <Navbar />
      </aside>
      <main class="flex-1 container mx-auto px-4 py-6">
        <slot />
      </main>
    </div>
  </div>
</template>