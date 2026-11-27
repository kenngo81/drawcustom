import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Builds the embeddable library (dist-lib/) — separate from the standalone app build (dist/). */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-lib',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: 'src/lib/index.ts',
      formats: ['es'],
      fileName: () => 'drawcustom.js',
      cssFileName: 'style',
    },
    rollupOptions: {
      output: {
        banner:
          '/*! DrawCustom | (c) 2026 Duc Ngo | AGPL-3.0-or-later | https://github.com/kenngo81/drawcutom */',
      },
      // Provided by the host app (one copy of React/Redux per page)
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@reduxjs/toolkit',
        'react-redux',
        'lucide-react',
      ],
    },
  },
});
