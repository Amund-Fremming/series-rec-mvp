import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9002,
    proxy: {
      '/login': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
      '/series': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
    },
  },
})
