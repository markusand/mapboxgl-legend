import path from 'path';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: '/@', replacement: path.resolve(import.meta.dirname, './src') },
    ],
  },
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/__tests__'],
      compilerOptions: { rootDir: 'src' },
      bundleTypes: true,
    }),
  ],
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    restoreMocks: true,
  },
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/index.ts'),
      name: 'LegendControl',
      cssFileName: 'style',
      fileName: format => (format === 'umd' ? 'index.umd.cjs' : `index.${format}.js`),
    },
  },
});
