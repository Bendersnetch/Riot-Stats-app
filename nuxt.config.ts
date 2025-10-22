import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    'nuxt-charts',
    '@pinia/nuxt',
    '@vueuse/nuxt'
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

  app: {
    head: {
      title: 'Riot Stats',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080/api'
    }
  },

  colorMode: {
    classSuffix: ''
  }
})