import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../contexts/useTheme';

const LOAD_STEPS = [
  { at: 0, label: 'Initializing neural field' },
  { at: 24, label: 'Connecting project data' },
  { at: 49, label: 'Mapping the interface' },
  { at: 74, label: 'Composing experience' },
  { at: 92, label: 'Ready to explore' },
];

const LOADER_MESSAGES = [
  'Turning ideas into useful digital experiences.',
  'Connecting creativity, code, and intelligence.',
  'Teaching pixels to think.',
  'Designing beyond the expected.',
  'Building what comes next.',
];

interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
}

function NeuralField({ dark, reduced }: { dark: boolean; reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let disposed = false;
    let pointerX: number | null = null;
    let pointerY: number | null = null;
    let touchReleaseTimer: number | undefined;
    const rows = window.innerWidth < 640 ? 13 : 17;
    const columns = window.innerWidth < 640 ? 22 : 30;
    const points: ProjectedPoint[] = new Array((rows + 1) * columns);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const updatePointer = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (touchReleaseTimer) window.clearTimeout(touchReleaseTimer);
      updatePointer(event);
    };
    const onPointerMove = (event: PointerEvent) => {
      updatePointer(event);
    };
    const clearPointer = () => {
      pointerX = null;
      pointerY = null;
    };
    const onPointerEnd = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') return;
      if (touchReleaseTimer) window.clearTimeout(touchReleaseTimer);
      // Keep a tap visible for a few frames, then let the field settle naturally.
      touchReleaseTimer = window.setTimeout(clearPointer, 180);
    };

    const disturb = (x: number, y: number) => {
      if (pointerX === null || pointerY === null || reduced) return { x, y };
      const dx = x - pointerX;
      const dy = y - pointerY;
      const distance = Math.hypot(dx, dy);
      const radius = Math.min(150, Math.max(90, width * 0.1));
      if (distance >= radius || distance === 0) return { x, y };
      const force = Math.pow(1 - distance / radius, 2) * 58;
      return {
        x: x + (dx / distance) * force,
        y: y + (dy / distance) * force,
      };
    };

    const projectField = (time: number) => {
      const centerX = width / 2;
      const centerY = height * (width < 640 ? 0.43 : 0.46);
      const fieldRadius = Math.min(width * (width < 640 ? 0.39 : 0.26), height * 0.32);
      const rotationY = reduced ? -0.28 : time * 0.00018;
      const rotationX = -0.22 + (reduced ? 0 : Math.sin(time * 0.00027) * 0.07);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      for (let row = 0; row <= rows; row++) {
        const theta = (row / rows) * Math.PI;
        for (let column = 0; column < columns; column++) {
          const phi = (column / columns) * Math.PI * 2;
          const waveTime = reduced ? 0.8 : time * 0.001;
          const deformation =
            1 +
            Math.sin(phi * 3 + waveTime * 0.9) * Math.sin(theta * 2.2) * 0.16 +
            Math.cos(theta * 5 - waveTime * 0.7) * 0.09 +
            Math.sin(phi * 5 - theta * 2 + waveTime) * 0.055;

          const sphereX = Math.sin(theta) * Math.cos(phi) * deformation;
          const sphereY = Math.cos(theta) * deformation;
          const sphereZ = Math.sin(theta) * Math.sin(phi) * deformation;

          const rotatedX = sphereX * cosY - sphereZ * sinY;
          const depthY = sphereX * sinY + sphereZ * cosY;
          const rotatedY = sphereY * cosX - depthY * sinX;
          const rotatedZ = sphereY * sinX + depthY * cosX;
          const perspective = 1.12 / (1.42 + rotatedZ * 0.24);
          const projectedX = centerX + rotatedX * fieldRadius * perspective;
          const projectedY = centerY + rotatedY * fieldRadius * perspective;
          const disturbed = disturb(projectedX, projectedY);

          points[row * columns + column] = {
            x: disturbed.x,
            y: disturbed.y,
            z: rotatedZ,
          };
        }
      }
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      projectField(time);
      context.lineWidth = dark ? 0.7 : 0.8;

      for (let row = 0; row <= rows; row++) {
        for (let column = 0; column < columns; column++) {
          const index = row * columns + column;
          const point = points[index];
          const right = points[row * columns + ((column + 1) % columns)];
          const below = row < rows ? points[(row + 1) * columns + column] : null;
          const depth = Math.max(0.12, Math.min(1, (point.z + 1.3) / 2.6));
          const hue = 222 + depth * 54;
          const lineAlpha = (dark ? 0.09 : 0.075) + depth * (dark ? 0.16 : 0.12);

          context.strokeStyle = `hsla(${hue}, 90%, ${dark ? 64 : 48}%, ${lineAlpha})`;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(right.x, right.y);
          if (below) {
            context.moveTo(point.x, point.y);
            context.lineTo(below.x, below.y);
          }
          context.stroke();
        }
      }

      context.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      for (const point of points) {
        const depth = Math.max(0.08, Math.min(1, (point.z + 1.25) / 2.5));
        const hue = 205 + depth * 76;
        const radius = 0.75 + depth * (dark ? 1.6 : 1.35);
        context.fillStyle = `hsla(${hue}, 94%, ${dark ? 65 : 47}%, ${0.34 + depth * 0.62})`;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
      }
      context.globalCompositeOperation = 'source-over';

      if (!reduced && !disposed) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerEnd, { passive: true });
    window.addEventListener('pointercancel', onPointerEnd, { passive: true });
    window.addEventListener('pointerleave', clearPointer);
    draw(0);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      if (touchReleaseTimer) window.clearTimeout(touchReleaseTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      window.removeEventListener('pointerleave', clearPointer);
    };
  }, [dark, reduced]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" aria-hidden="true" />;
}

export function Loader({ onFinish }: { onFinish: () => void }) {
  const { theme } = useTheme();
  const reduced = useReducedMotion() === true;
  const dark = theme === 'dark';
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [messageOrder] = useState(() => {
    const messages = [...LOADER_MESSAGES];
    for (let index = messages.length - 1; index > 0; index--) {
      const swapWith = Math.floor(Math.random() * (index + 1));
      [messages[index], messages[swapWith]] = [messages[swapWith], messages[index]];
    }
    return messages;
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const startedAt = performance.now();
    const runTime = reduced ? 480 : 2900;
    let frame = 0;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = (now: number) => {
      const ratio = Math.min(1, (now - startedAt) / runTime);
      const eased = ratio < 0.82
        ? Math.pow(ratio / 0.82, 0.88) * 0.9
        : 0.9 + ((ratio - 0.82) / 0.18) * 0.1;
      setProgress(Math.min(100, Math.round(eased * 100)));

      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }

      setExiting(true);
      finishTimer = setTimeout(onFinish, reduced ? 100 : 760);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (finishTimer) clearTimeout(finishTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onFinish, reduced]);

  const activeStep = [...LOAD_STEPS].reverse().find((step) => progress >= step.at) ?? LOAD_STEPS[0];
  const activeMessage = messageOrder[Math.min(messageOrder.length - 1, Math.floor(progress / 21))];

  return (
    <motion.div
      className="fixed inset-0 z-[100] isolate overflow-hidden bg-[#f6f7fb] text-slate-950 dark:bg-[#030014] dark:text-white"
      role="status"
      aria-live="polite"
      aria-label={`${activeStep.label}, ${progress}%`}
      animate={exiting
        ? { opacity: 0, scale: 1.025, filter: 'blur(8px)' }
        : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: reduced ? 0.01 : 0.68, ease: [0.76, 0, 0.24, 1] }}
    >
      <div
        className="absolute inset-0 opacity-60 dark:opacity-80"
        style={{
          background: dark
            ? 'radial-gradient(circle at 50% 43%, rgba(99,102,241,.13), transparent 31%), radial-gradient(circle at 62% 50%, rgba(168,85,247,.08), transparent 28%)'
            : 'radial-gradient(circle at 50% 43%, rgba(99,102,241,.12), transparent 31%), radial-gradient(circle at 62% 50%, rgba(168,85,247,.07), transparent 28%)',
        }}
        aria-hidden="true"
      />

      <NeuralField dark={dark} reduced={reduced} />

      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]"
        style={{
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(circle at center, black, transparent 78%)',
        }}
        aria-hidden="true"
      />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 sm:px-9 sm:py-8">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}Logo.png`}
            alt=""
            className="h-8 w-8 rounded-lg shadow-[0_8px_28px_rgba(99,102,241,.18)] sm:h-9 sm:w-9"
          />
          <div>
            <p className="text-xs font-semibold tracking-tight sm:text-sm">Kavisha Liyanage</p>
            <p className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.2em] text-slate-500 sm:text-[8px] dark:text-white/35">
              Portfolio / 2026
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[7px] uppercase tracking-[0.2em] text-slate-500 sm:text-[8px] dark:text-white/35">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,.75)]" />
          System online
        </div>
      </header>

      <main className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="font-mono text-[8px] uppercase tracking-[0.34em] text-brand-primary sm:text-[10px]"
        >
          Software engineering · Artificial intelligence
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
          className="mt-4 text-[clamp(2.45rem,8vw,6.8rem)] font-bold leading-[0.88] tracking-[-0.065em] text-slate-950 dark:text-white"
        >
          Kavisha
          <br />
          <span className="text-slate-500 dark:text-slate-400">Liyanage.</span>
        </motion.h1>
        <div className="relative mt-5 h-5 w-full max-w-lg overflow-hidden text-[11px] leading-relaxed text-slate-600 sm:text-sm dark:text-slate-400" aria-hidden="true">
          <AnimatePresence initial={false}>
            <motion.p
              key={activeMessage}
              className="absolute inset-x-0 top-0"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: reduced ? 0.01 : 0.28, ease: 'easeOut' }}
            >
              {activeMessage}
            </motion.p>
          </AnimatePresence>
        </div>
      </main>

      <div className="absolute bottom-[17%] left-1/2 z-10 w-[min(84vw,560px)] -translate-x-1/2">
        <div className="mb-3 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.18em] text-slate-500 dark:text-white/35">
          <motion.span
            key={activeStep.label}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activeStep.label}
          </motion.span>
          <span className="tabular-nums text-slate-800 dark:text-white/70">{String(progress).padStart(3, '0')}%</span>
        </div>
        <div className="flex gap-1.5">
          {LOAD_STEPS.map((step, index) => {
            const nextAt = LOAD_STEPS[index + 1]?.at ?? 101;
            const segmentProgress = Math.max(0, Math.min(1, (progress - step.at) / (nextAt - step.at)));
            return (
              <div key={step.at} className="h-1 flex-1 overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10">
                <motion.div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                  animate={{ scaleX: segmentProgress }}
                  transition={{ duration: 0.08, ease: 'linear' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <footer className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-5 pb-5 font-mono text-[7px] uppercase tracking-[0.18em] text-slate-400 sm:px-9 sm:pb-8 sm:text-[8px] dark:text-white/25">
        <p>Built with React · TypeScript · Canvas</p>
        <p className="hidden sm:block">Move your pointer to disturb the network</p>
        <p className="sm:hidden">Tap or drag to disturb the network</p>
      </footer>
    </motion.div>
  );
}
