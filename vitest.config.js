import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js', './tests/setup.js'],
    exclude: [
      '**/node_modules/**',
      '**/tests/e2e/**' // Exclude Playwright tests from vitest
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'public/',
        'scripts/',
        '*.config.js'
      ]
    }
  },
  resolve: {
    alias: {
      '@': new URL('./js', import.meta.url).pathname
    }
  }
});