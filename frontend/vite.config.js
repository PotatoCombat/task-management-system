import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Documentation: https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // Required for Vite to handle .jsx files
  build: {
    rollupOptions: {
      input: {
        main: '/src/index.jsx' // Entry point
      }
    }
  }
});
