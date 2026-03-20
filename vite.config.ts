import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiProxyTargetRaw = process.env.VITE_API_PROXY_TARGET ?? 'http://studio-api.interparts.ru'
// Если случайно в target передали /odata, убираем, чтобы не получить двойной /odata
const apiProxyTarget = apiProxyTargetRaw.replace(/\/odata\/?$/, '')

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // axios в `odataClient` делает запросы вида `/odata/ProductsMnk...`,
      // поэтому браузер ходит в тот же origin и CORS не срабатывает.
      '/odata': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})