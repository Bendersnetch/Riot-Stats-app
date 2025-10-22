<template>
  <div class="flex items-center justify-center h-full">
    <div
      class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      role="status"
      aria-label="Loading"
    ></div>
  </div>
</template>

<style scoped>
/* Optional: tweak animation speed */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
