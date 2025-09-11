import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'
import fs from 'fs'

// Get package.json version
function getPackageVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'))
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

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, '../src'),
  base: process.env.NODE_ENV === 'production' ? '/Daggerheart/' : '/', // GitHub Pages subdirectory only in production
  publicDir: path.resolve(__dirname, '../public'), // Point to public directory
  define: {
    __APP_VERSION__: JSON.stringify(`${getPackageVersion()} (${getGitCommitHash()})`)
  },
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: 5173, // Default Vite port
    hmr: {
      port: 5173,
      host: 'localhost'
    },
    force: true // Force reload on changes
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
