import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base must match the GitHub repo name so assets resolve on GitHub Pages
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Manchester-auto-gallery/',
  build: {
    target: 'es2020',
    cssMinify: 'lightningcss',
    // react/react-dom get their own long-cached chunk; three.js already lives in the lazy hero chunk
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
