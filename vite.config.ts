import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/recept/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})
