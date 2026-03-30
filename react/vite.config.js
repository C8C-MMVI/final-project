import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/php_sys': {
        target: 'http://php:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/php_sys/, ''), // strips /php_sys prefix
      },
      '/images': {
        target: 'http://php:8000',
        changeOrigin: true,
      },
    },
  },
});
