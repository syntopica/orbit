import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: {
    outDir: '../server/dist/public',
    emptyOutDir: true,
    // The CSP has no data: in font-src, so no asset may be inlined.
    assetsInlineLimit: 0,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8790',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (request) =>
            request.setHeader('Origin', 'http://127.0.0.1:8790'),
          )
        },
      },
    },
  },
})
