import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://residencial-antonina-backend-pro÷duction.up.railway.app',
        // target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
