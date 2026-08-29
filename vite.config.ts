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
    // By default Vite emits a <link rel="modulepreload"> for the lazily-imported
    // Spline chunk, so the browser downloads ~570 KB WHILE the intro loader is on
    // screen. On a cold cache that download + compile starves the loader's canvas
    // rAF loop and makes the loading screen stutter. Drop Spline from the preload
    // graph so it is fetched only when the code actually imports it (post-loader).
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter((dep) => !/react-spline|splinetool/.test(dep)),
    },
  },
})
