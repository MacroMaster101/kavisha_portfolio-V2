import robotScene from '../assets/spline/robot.splinecode?url';

// Interactive robot that follows the cursor, self-hosted (originally
// https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode) so the site does not
// depend on, or grant CSP access to, Spline's servers at runtime.
// To swap: on spline.design open a scene → "Export" → "Code Export", download the
// .splinecode file and replace src/assets/spline/robot.splinecode with it.
export const SPLINE_ROBOT = robotScene;

// Where the runtime loads its WASM modules from; vite.config.ts serves them here.
export const SPLINE_WASM_PATH = `${import.meta.env.BASE_URL}spline`;

// Warms the HTTP cache with the scene file (~1.2 MB, the largest part of the robot)
// while the intro loader plays — 6 s on a first visit — instead of starting a cold
// download after it. Network only: nothing is parsed or executed, so the loader stays
// smooth. The runtime later requests the same URL with the same default fetch options
// and is served from cache. Skipped when the visitor asked to save data or the
// browser has no WebGL2 (the robot won't mount there). Returns a cancel function.
export function warmSplineScene(): () => void {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData || typeof WebGL2RenderingContext === 'undefined') return () => undefined;

  const controller = new AbortController();
  fetch(SPLINE_ROBOT, { priority: 'low', signal: controller.signal })
    .then(response => response.arrayBuffer())
    .catch(() => undefined); // best effort; the runtime fetches it again if needed
  return () => controller.abort();
}
