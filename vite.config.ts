import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    // The isolated charts chunk is ~150 kB gzipped by design; the warning would only be noise.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Recharts + d3 weigh more than the whole app; a separate chunk keeps it cacheable across deploys.
        manualChunks: {
          charts: ['recharts'],
        },
      },
    },
  },
});
