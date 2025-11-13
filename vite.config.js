import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,   // Local dev port (optional)
  },
  preview: {
    port: 8080,   // For npm start (vite preview)
  },
  build: {
    outDir: "dist",   // Ensure build goes to dist folder
    emptyOutDir: true // Clean output before build
  }
})
