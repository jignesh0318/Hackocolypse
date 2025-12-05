import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // PWA requires specific build settings
    rollupOptions: {
      output: {
        // Ensure service worker is output correctly
        manualChunks: undefined,
      }
    }
  }
})