import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  base: '/recept/',
  plugins: [
    react(),
    nodePolyfills({
      // Enable polyfills for Buffer and other Node.js globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
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
      output: {
        manualChunks: {
          // React and React DOM in one chunk (changes infrequently)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Markdown processing libraries in another chunk
          'markdown-vendor': ['marked', 'gray-matter'],
          // Icons in their own chunk
          'icons': ['lucide-react'],
        },
      },
    },
  },
})
