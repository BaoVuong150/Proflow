import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        target: 'http://host.docker.internal:3001',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://host.docker.internal:3001',
        changeOrigin: true,
      },
      '/broadcasting': {
        target: 'http://host.docker.internal:3001',
        changeOrigin: true,
      },
    },
  },
})
