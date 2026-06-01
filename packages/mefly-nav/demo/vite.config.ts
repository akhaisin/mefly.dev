import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      'mefly-nav': resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    fs: {
      allow: [resolve(__dirname, '..'), resolve(__dirname)],
    },
  },
});
