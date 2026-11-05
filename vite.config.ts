import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base must match the GitHub repo name so assets resolve on GitHub Pages
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Manchester-auto-gallery/',
})
