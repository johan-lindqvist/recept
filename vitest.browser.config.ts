import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'

// Real-browser config for layout/computed-style assertions that happy-dom
// cannot make (it does not perform layout). Runs only *.browser.test.tsx
// files in headless Chromium via Playwright. Invoke with `npm run test:browser`.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    include: ['src/**/*.browser.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
