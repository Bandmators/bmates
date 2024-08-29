import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
