import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    proxy: {
      // 백엔드(Express, server.js)는 3000번 포트에서 별도로 실행된다
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist'
  }
});
