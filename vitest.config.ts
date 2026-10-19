import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: false,
    maxConcurrency: 1,
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ['tests/**/*.test.ts'],
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
