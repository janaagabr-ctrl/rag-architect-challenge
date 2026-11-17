import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Output goes to docs/, which GitHub Pages serves from the main branch.
// Relative base so the build works at a domain root or a GitHub Pages sub-path.
// React APIs are served by preact/compat to keep the static bundle small (~10x lighter).
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/client': 'preact/compat/client',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  build: { outDir: 'docs', emptyOutDir: true, assetsInlineLimit: 100000, cssCodeSplit: false, modulePreload: false },
});
