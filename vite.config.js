import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2020',
    cssTarget: 'chrome100',
  },
});
