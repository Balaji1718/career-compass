import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// The frontend is always served by the Express server (one port, one origin),
// so no dev proxy is needed: /api requests hit the same server.
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
    sourcemap: false,
  },
});
