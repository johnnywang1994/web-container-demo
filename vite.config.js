import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Pages from 'vite-plugin-pages'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Pages({
      pagesDir: [{ dir: 'src/pages', baseRoute: '' }],
      extensions: ['jsx'],
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },

  server: {
    // https://webcontainers.io/guides/quickstart#cross-origin-isolation
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    },
  },
})
