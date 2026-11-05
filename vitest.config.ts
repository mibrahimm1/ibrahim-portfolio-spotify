import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Unit tests always use the fixture, so they don't depend on your own content.
      '@portfolio-content': path.resolve(__dirname, './tests/fixtures/portfolio.json'),
    },
  },
});
