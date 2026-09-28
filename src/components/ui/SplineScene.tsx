import { useEffect, useRef, useState } from 'react';
import { Application } from '@splinetool/runtime';

// Minimal replacement for @splinetool/react-spline, which only forwards
// `renderOnDemand` and `wasmPath` to the runtime. Spline runtime 2 otherwise
// auto-selects its WebGPU pipeline, which (a) logs a Chrome warning on every load
// on Windows ("powerPreference option is currently ignored") and (b) bypasses the
// WebGL2 capability probe and WebGL failure detection in Hero.tsx. Forcing the
// classic WebGL pipeline keeps the robot on the path those safeguards were built for.
// The runtime sizes the canvas to its parent itself, so no resize wrapper is needed.
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
    const app = new Application(canvas, { renderer: 'webgl' });
    app.load(scene)
      .then(() => {
        if (!disposed) onLoadRef.current?.(app);
      })
      .catch((error: unknown) => {
        if (!disposed) setLoadError(error ?? new Error('Spline scene failed to load'));
      });

    return () => {
      disposed = true;
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
