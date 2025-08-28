import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, '../src'),
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: 5173, // Default Vite port
  },
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true
  }
})
