import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  server: {
    host: true,
    watch: {
      usePolling: true,
      interval: 500,
    },
    proxy: {
      '/api': {
        target: 'http://gateway:9090',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
      '/ws': {
        target: 'http://gateway:9090',
        changeOrigin: true,
        ws: true,                          // ← enables WebSocket proxying
      },
      '/images': {
        target: 'http://gateway:9090',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
      '/sales': {
        target: 'http://gateway:9090',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
      '/django': {
        target: 'http://gateway:9090',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
    },
  },
});