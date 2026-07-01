import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart(),
    react(),
  ],
  server: {
    port: 5173,
    strictPort: false,
    host: '0.0.0.0',
  },
  build: {
    target: 'ES2020',
    sourcemap: false,
  },
});
