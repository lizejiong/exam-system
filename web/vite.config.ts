import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = (port: string | undefined, fallback: number) =>
    `http://localhost:${port ?? fallback}`

  return {
    plugins: [react()],
    server: {
      // Development proxy: frontend keeps /service/path, backend receives /path.
      proxy: {
        '/user': {
          target: target(env.USER_SERVICE_PORT, 3001),
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/user/, ''),
        },
        '^/exam/(add|list|find|answer|delete|save|publish|unpublish)(/|$)': {
          target: target(env.EXAM_SERVICE_PORT, 3002),
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/exam/, ''),
        },
        '/answer': {
          target: target(env.ANSWER_SERVICE_PORT, 3003),
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/answer/, ''),
        },
        '/analyse': {
          target: target(env.ANALYSE_SERVICE_PORT, 3004),
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/analyse/, ''),
        },
        '/api': {
          target: target(env.APP_PORT, 3000),
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
