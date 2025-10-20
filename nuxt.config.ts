import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    'nuxt-charts'
  ],
  vite: {
    plugins: [
      tailwindcss()
    ]
  },

  icon: {
    mode: 'css',
    cssLayer: 'base'
  },
})