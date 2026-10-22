import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Spline's runtime downloads its WASM modules (bevel, process, physics, …) from
// unpkg.com and cdn.spline.design unless it is given a `wasmPath`. Serve them from
// our own origin instead, straight out of the installed package so they always match
// the runtime version, and keep those third-party hosts out of the CSP. navmesh.js is
// included because the game-controls worker imports it from the same path.
const SPLINE_BUILD = fileURLToPath(new URL('./node_modules/@splinetool/runtime/build/', import.meta.url))
const SPLINE_PUBLIC_DIR = 'spline'

function splineRuntimeAssets(): Plugin {
  const files = () =>
    readdirSync(SPLINE_BUILD).filter((name) => name.endsWith('.wasm') || name === 'navmesh.js')
  const contentType = (name: string) => (name.endsWith('.wasm') ? 'application/wasm' : 'text/javascript')

  return {
    name: 'spline-runtime-assets',
    configureServer(server) {
      server.middlewares.use(`/${SPLINE_PUBLIC_DIR}/`, (req, res, next) => {
        const name = decodeURIComponent((req.url ?? '').split('?')[0].replace(/^\//, ''))
        if (!files().includes(name)) return next()
        res.setHeader('Content-Type', contentType(name))
        res.end(readFileSync(SPLINE_BUILD + name))
      })
    },
    generateBundle() {
      for (const name of files()) {
        this.emitFile({
          type: 'asset',
          fileName: `${SPLINE_PUBLIC_DIR}/${name}`,
          source: readFileSync(SPLINE_BUILD + name),
        })
      }
    },
  }
}

// Spline's runtime bundles msgpackr, which speeds up decoding by compiling record
// readers with `Function()` once a record shape repeats. Our CSP has no 'unsafe-eval',
// so that call is blocked (a DevTools "CSP blocks eval" issue) and msgpackr falls back
// by setting its inline-read threshold to Infinity. Start it at Infinity instead, so the
// blocked call is never attempted — decoding is identical to the CSP fallback path.
const MSGPACKR_THRESHOLD = /(\.name="MessagePack 0xC1";var [\w$]+=!1,[\w$]+=)2,/

function splineNoEval(): Plugin {
  return {
    name: 'spline-no-eval',
    apply: 'build',
    transform(code, id) {
      if (!id.includes('@splinetool/runtime/build/') || !code.includes('MessagePack 0xC1')) return null
      if (!MSGPACKR_THRESHOLD.test(code)) {
        this.warn('msgpackr threshold not found in the Spline runtime; CSP eval issue will return')
        return null
      }
      return { code: code.replace(MSGPACKR_THRESHOLD, '$11/0,'), map: null }
    },
  }
}

// Site details that index.html repeats across its meta tags, share cards and JSON-LD,
// written there as %SITE_URL%, %SITE_TITLE% and %SHARE_DESCRIPTION%. (robots.txt,
// sitemap.xml and vercel.json are served as-is and still spell out the URL.)
const SITE: Record<string, string> = {
  SITE_URL: 'https://kavisha.online/',
  SITE_TITLE: 'Kavisha Liyanage — Software Engineering & AI Portfolio',
  SHARE_DESCRIPTION: 'Full-stack web, mobile, and machine-learning projects by Kavisha Liyanage.',
}

function siteMetadata(): Plugin {
  return {
    name: 'site-metadata',
    // Before Vite's own %ENV% replacement, which would warn about these names.
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html.replace(/%(SITE_URL|SITE_TITLE|SHARE_DESCRIPTION)%/g, (_, key: string) => SITE[key].replaceAll('&', '&amp;')),
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), splineRuntimeAssets(), splineNoEval(), siteMetadata()],
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
        deps.filter((dep) => !/SplineScene|splinetool/.test(dep)),
    },
  },
})
