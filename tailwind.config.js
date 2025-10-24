/**
 * Tailwind CSS configuration (ESM)
 * Force class-based dark mode so "dark:" utilities respond to the
 * `dark` class applied on <html> by @nuxtjs/color-mode.
 */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
  ],
};

