import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: '/@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  plugins: [
    dts({ insertTypesEntry: true }),
  ],
  css: {
    preprocessorOptions: {
      scss: { api: 'modern' },
    },
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'LegendControl',
      fileName: format => `index.${format}.js`,
    },
  },
});
