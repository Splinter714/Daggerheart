import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'
import fs from 'fs'

// Get package.json version
function getPackageVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf8'))
    return packageJson.version
  } catch (error) {
    return 'dev'
  }
}

// Get git commit hash for version
function getGitCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch (error) {
    return 'dev'
  }
}

// Stamp a unique build id into the service worker's cache name so every deploy
// auto-updates the SW and purges old caches (no manual version bumping).
const BUILD_ID = `${getGitCommitHash()}-${Date.now()}`

function serviceWorkerVersionPlugin() {
  return {
    name: 'service-worker-version',
    closeBundle() {
      const swPath = path.resolve(__dirname, './dist/pwa-service-worker.js')
      try {
        const content = fs.readFileSync(swPath, 'utf8').replace(/__BUILD_ID__/g, BUILD_ID)
        fs.writeFileSync(swPath, content)
        console.log(`Service worker cache id: daggerheart-gm-${BUILD_ID}`)
      } catch (error) {
        console.warn('service-worker-version: could not patch service worker', error.message)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), serviceWorkerVersionPlugin()],
  root: path.resolve(__dirname, './src'),
  base: process.env.NODE_ENV === 'production' ? '/Daggerheart/' : '/', // GitHub Pages subdirectory only in production
  publicDir: path.resolve(__dirname, './public'), // Point to public directory relative to project root
  define: {
    __APP_VERSION__: JSON.stringify(`${getPackageVersion()} (${getGitCommitHash()})`)
  },
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: 5173, // Default Vite port
    allowedHosts: [
      'irrigation-nothing-comfortable-occasions.trycloudflare.com'
    ],
    hmr: {
      port: 5179,
      host: 'localhost'
    },
    force: true // Force reload on changes
  },
  build: {
    outDir: path.resolve(__dirname, './dist'),
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
