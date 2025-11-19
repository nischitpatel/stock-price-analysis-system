import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/

export default defineConfig({
  plugins: [tailwindcss(),react()],
  erver: {
    proxy: {
      // Frontend calls /api/... → Vite proxies to your backend http://localhost:5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // If your backend does NOT prefix routes with /api, uncomment:
        // rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
})
