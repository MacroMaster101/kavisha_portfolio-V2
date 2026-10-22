import { useEffect, useRef, useState } from 'react';
import { Application } from '@splinetool/runtime';
import { SPLINE_WASM_PATH } from '../../lib/splineScene';

// The runtime internals behind stop()/play() that pause only the render loop (checked
// against @splinetool/runtime 2.x: render is a bound arrow function, and _lastTime feeds
// its frame delta). Guarded at runtime, so a future runtime without them keeps rendering.
interface RenderLoop {
  _renderer?: { setAnimationLoop(callback: ((time: number) => void) | null): void };
  render?: (time: number) => void;
  _lastTime?: number;
}

const HEAVY_FRAME_MS = 12;

// Minimal replacement for @splinetool/react-spline, which only forwards
// `renderOnDemand` and `wasmPath` to the runtime. Spline runtime 2 otherwise
// auto-selects its WebGPU pipeline, which (a) logs a Chrome warning on every load
// on Windows ("powerPreference option is currently ignored") and (b) bypasses the
// WebGL2 capability probe and WebGL failure detection in Hero.tsx. Forcing the
// classic WebGL pipeline keeps the robot on the path those safeguards were built for.
// The runtime sizes the canvas to its parent itself, so no resize wrapper is needed.
// `wasmPath` keeps its WASM downloads on our origin instead of unpkg/cdn.spline.design.
export default function SplineScene({
  scene,
  className,
  onLoad,
}: {
  scene: string;
  className?: string;
  onLoad?: (app: Application) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onLoadRef = useRef(onLoad);
  const [loadError, setLoadError] = useState<unknown>(null);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let visible = true;
    const app = new Application(canvas, { renderer: 'webgl', wasmPath: SPLINE_WASM_PATH });

    // The render loop can cost a full frame budget or more on modest hardware, and it ran
    // even with the robot scrolled out of sight, slowing every other section. So:
    //  - pause just the loop while the canvas is off screen. Not app.stop()/play(): play()
    //    also resumes the scene's events, which fires its Start event again and replays
    //    the robot's intro;
    //  - on a device where a frame averages over 12ms, render every other frame (~30fps).
    //    The runtime takes its time step from the clock, so the robot keeps its speed.
    const loop = app as unknown as RenderLoop;
    let averageMs = 0;
    let skipNext = false;
    const throttledRender = (time: number) => {
      if (averageMs > HEAVY_FRAME_MS && (skipNext = !skipNext)) return;
      const start = performance.now();
      loop.render?.(time);
      averageMs = averageMs * 0.9 + (performance.now() - start) * 0.1;
    };
    const syncLoop = () => {
      if (disposed || !loop._renderer || typeof loop.render !== 'function') return;
      if (visible) {
        loop._lastTime = undefined; // resume without a jump for the time spent away
        loop._renderer.setAnimationLoop(throttledRender);
      } else {
        loop._renderer.setAnimationLoop(null);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncLoop();
    });
    observer.observe(canvas);

    app.load(scene)
      .then(() => {
        if (disposed) return;
        // Loading starts the runtime's own loop; swap in ours.
        syncLoop();
        onLoadRef.current?.(app);
      })
      .catch((error: unknown) => {
        if (!disposed) setLoadError(error ?? new Error('Spline scene failed to load'));
      });

    return () => {
      disposed = true;
      observer.disconnect();
      app.dispose();
    };
  }, [scene]);

  // Surface async load failures to the nearest error boundary (Hero's
  // RobotErrorBoundary swaps in the static fallback), as react-spline did.
  if (loadError) throw loadError;

  return (
    <div className={className} style={{ overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
