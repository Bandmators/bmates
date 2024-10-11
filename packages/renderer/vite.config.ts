import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
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
      name: 'index',
      fileName: 'index',
      // entry: path.resolve(__dirname, 'src/index.ts'),
      // formats: ['es', 'cjs'],
      // fileName: format => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    // rollupOptions: {
    //   output: {
    //     preserveModules: true,
    //     // preserveModulesRoot: 'src',
    //     entryFileNames: '[name].js',
    //   },
    // },
    minify: false,
    sourcemap: false,
    outDir: 'dist',
    emptyOutDir: true,
  },
  // resolve: {
  //   alias: {
  //     '@': path.resolve(__dirname, 'src'),
  //   },
  // },
});
