import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    watch: {
      usePolling: true,   // ← fixes WSL2 file watching
      interval: 500,      // check every 500ms
    },
    proxy: {
      '/api': {
        target: 'http://php:8000',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',             // ← FIXED: forward session cookie correctly
      },
      '/images': {
        target: 'http://php:8000',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',             // ← FIXED: consistent cookie handling
      },
    },
  },
});