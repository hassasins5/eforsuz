import { defineConfig } from 'vite';

export default defineConfig({
  base: '/eforsuz/',
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  build: {
    target: 'es2020',
    outDir: 'dist'
  }
});
