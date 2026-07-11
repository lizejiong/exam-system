import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 开发期按服务前缀分流到各后端服务（后端路由无前缀，故 rewrite 去掉前缀）
    //   前端请求 /user/login  ->  http://localhost:3001/login
    //   前端请求 /exam/add    ->  http://localhost:3002/add
    // 约定：前端统一用 /<service>/xxx 调用后端
    proxy: {
      '/user': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/user/, ''),
      },
      '^/exam/(add|list|find|answer|delete|save|publish|unpublish)(/|$)': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/exam/, ''),
      },
      '/answer': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/answer/, ''),
      },
      '/analyse': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/analyse/, ''),
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
