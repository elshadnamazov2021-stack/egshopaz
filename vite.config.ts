import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  server: {
    port: 5173,
    strictPort: false,
    host: '0.0.0.0',
  },
  build: {
    target: 'ES2020',
    outDir: 'dist',
    sourcemap: false,
  },
});
