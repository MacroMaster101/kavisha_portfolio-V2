import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Spline's physics/runtime chunks are intentionally lazy-loaded only after
    // the WebGL2 capability gate passes, so they do not block initial rendering.
    chunkSizeWarningLimit: 2100,
  },
})
