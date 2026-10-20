import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_API = 'https://marketeer-api.dev.codexcape.solutions'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const api = (env.VITE_API_BASE_URL || DEFAULT_API).replace(/\/$/, '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: api, changeOrigin: true, secure: false },
      },
    },
  }
})
