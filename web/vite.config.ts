import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const appPort = env.APP_PORT ?? 3000

  return {
    plugins: [react()],
    server: {
      // Frontend only knows the API Gateway. The gateway routes to services.
      proxy: {
        '/api': {
          target: `http://localhost:${appPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
