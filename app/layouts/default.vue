<template>
  <div class="min-h-screen transition-colors duration-300">
    <div class="flex min-h-screen">
      <aside class="nav-aside w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 sticky top-0 h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Navbar />
      </aside>
      <main class="flex-1 container mx-auto px-4 py-6">
        <slot />
      </main>
    </div>
  </div>
</template>