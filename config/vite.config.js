import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'

// Get git commit hash for version
function getGitCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch (error) {
    return 'dev'
  }
}

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, '../src'),
  base: '/Daggerheart/', // GitHub Pages subdirectory
  define: {
    __APP_VERSION__: JSON.stringify(getGitCommitHash())
  },
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: 5173, // Default Vite port
  },
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          dndkit: ['@dnd-kit/core','@dnd-kit/sortable','@dnd-kit/utilities'],
          fa: ['@fortawesome/fontawesome-svg-core','@fortawesome/free-solid-svg-icons','@fortawesome/react-fontawesome'],
          lucide: ['lucide-react'],
        }
      }
    }
  }
})
