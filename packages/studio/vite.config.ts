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
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', '__tests__', 'src/App.tsx', 'src/App.css', 'src/main.tsx'],
      outDir: 'dist',
    }),
    tsconfigPaths(),
  ],
  build: {
    ssr: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'index',
      fileName: 'index',
      // formats: ['es', 'cjs'],
      // fileName: format => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
        },
      },
      // output: {
      //   preserveModules: true,
      //   preserveModulesRoot: 'src',
      //   entryFileNames: '[name].js',
      // },
    },
    commonjsOptions: {
      esmExternals: ['react'],
    },
    // minify: false,
    // sourcemap: true,
    // outDir: 'dist',
    // emptyOutDir: true,
  },
  server: {
    proxy: {
      '/audio': {
        target: 'https://bandmators.github.io',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/audio/, ''),
      },
    },
  },
});
