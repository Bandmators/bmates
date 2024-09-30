import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', '__tests__'],
      outDir: 'dist',
    }),
    tsconfigPaths(),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    minify: false,
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/audio': {
        target: 'https://baggun.s3.ap-northeast-2.amazonaws.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/audio/, ''),
      },
    },
  },
});
