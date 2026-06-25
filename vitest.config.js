import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Use the same React (automatic JSX runtime) transform as the app build, so JSX in
  // both tests and components works without importing React explicitly.
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    server: {
      // FontAwesome's svg-core imports its own package.json; Node's ESM loader rejects
      // that without an import attribute. Inline the @fortawesome packages so Vite
      // transforms them (it handles JSON imports) instead of Node loading them raw —
      // needed for the DashboardView boot smoke to import its icon tree.
      deps: { inline: [/@fortawesome\//] }
    }
  }
})


