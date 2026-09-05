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

interface BrainNode {
  nx: number;
  ny: number;
  nz: number;
  tx: number;
  ty: number;
  phase: number;
  hemisphere: -1 | 1;
}

interface BrainEdge {
  from: number;
  to: number;
}

interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
}

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function createMonogramTargets(count: number, random: () => number) {
  const segments = [
    { ax: -0.76, ay: -0.82, bx: -0.76, by: 0.82, weight: 0.24 },
    { ax: -0.7, ay: 0.02, bx: -0.08, by: -0.82, weight: 0.18 },
    { ax: -0.7, ay: 0.02, bx: -0.02, by: 0.82, weight: 0.2 },
    { ax: 0.2, ay: -0.82, bx: 0.2, by: 0.82, weight: 0.23 },
    { ax: 0.2, ay: 0.82, bx: 0.9, by: 0.82, weight: 0.15 },
  ];
  const targets: Array<{ x: number; y: number }> = [];

  for (let index = 0; index < count; index++) {
    const position = (index + 0.5) / count;
    let start = 0;
    const segment = segments.find((candidate) => {
      const inside = position <= start + candidate.weight;
      if (!inside) start += candidate.weight;
      return inside;
    }) ?? segments[segments.length - 1];
    const local = Math.max(0, Math.min(1, (position - start) / segment.weight));
    const dx = segment.bx - segment.ax;
    const dy = segment.by - segment.ay;
    const length = Math.hypot(dx, dy);
    const thickness = (random() - 0.5) * 0.13;

    targets.push({
      x: segment.ax + dx * local + (-dy / length) * thickness + (random() - 0.5) * 0.025,
      y: segment.ay + dy * local + (dx / length) * thickness + (random() - 0.5) * 0.025,
    });
  }

  return targets;
}

function createBrainNetwork(compact: boolean) {
  const random = seededRandom(20260824);
  const nodes: BrainNode[] = [];
  const targetCount = compact ? 120 : 180;

  // Two overlapping lobes form the calm neural silhouette before it morphs
  // into the KL monogram later in the loading sequence.
  while (nodes.length < targetCount) {
    const nx = random() * 2.2 - 1.1;
    const ny = random() * 2 - 1;
    const hemisphere: -1 | 1 = nx < 0 ? -1 : 1;
    const lobeCenter = hemisphere * 0.29;
    const inLobe = Math.pow((nx - lobeCenter) / 0.82, 2) + Math.pow((ny + 0.08) / 0.96, 2) <= 1;
    const lowerTaper = ny < 0.52 || Math.abs(nx) < 0.62 - (ny - 0.52) * 0.82;
    const centralFissure = Math.abs(nx) > 0.025 + Math.max(0, -ny) * 0.018;

    if (!inLobe || !lowerTaper || !centralFissure) continue;

    const edgeDistance = Math.max(0, 1 - Math.pow((nx - lobeCenter) / 0.82, 2) - Math.pow((ny + 0.08) / 0.96, 2));
    nodes.push({
      nx,
      ny,
      nz: (random() * 2 - 1) * Math.sqrt(edgeDistance) * 0.34,
      tx: 0,
      ty: 0,
      phase: random() * Math.PI * 2,
      hemisphere,
    });
  }

  const targets = createMonogramTargets(targetCount, random).sort((a, b) => a.y - b.y || a.x - b.x);
  const nodeOrder = nodes
    .map((_, index) => index)
    .sort((a, b) => nodes[a].ny - nodes[b].ny || nodes[a].nx - nodes[b].nx);
  nodeOrder.forEach((nodeIndex, targetIndex) => {
    nodes[nodeIndex].tx = targets[targetIndex].x;
    nodes[nodeIndex].ty = targets[targetIndex].y;
  });

  const edges: BrainEdge[] = [];
  const edgeKeys = new Set<string>();
  nodes.forEach((node, from) => {
    const nearest = nodes
      .map((candidate, to) => ({
        to,
        distance: Math.hypot(node.nx - candidate.nx, node.ny - candidate.ny, (node.nz - candidate.nz) * 0.7),
      }))
      .filter(({ to, distance }) => to !== from && distance < 0.245)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, compact ? 2 : 3);

    nearest.forEach(({ to }) => {
      const key = from < to ? `${from}:${to}` : `${to}:${from}`;
      if (edgeKeys.has(key)) return;
      edgeKeys.add(key);
      edges.push({ from, to });
    });
  });

  const monogramEdges: BrainEdge[] = [];
  const monogramEdgeKeys = new Set<string>();
  nodes.forEach((node, from) => {
    const nearest = nodes
      .map((candidate, to) => ({
        to,
        distance: Math.hypot(node.tx - candidate.tx, node.ty - candidate.ty),
      }))
      .filter(({ to, distance }) => to !== from && distance < 0.19)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);

    nearest.forEach(({ to }) => {
      const key = from < to ? `${from}:${to}` : `${to}:${from}`;
      if (monogramEdgeKeys.has(key)) return;
      monogramEdgeKeys.add(key);
      monogramEdges.push({ from, to });
    });
  });

  return { nodes, edges, monogramEdges };
}

function NeuralBrain({ dark, reduced, progress }: { dark: boolean; reduced: boolean; progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

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
    let currentMorph = 0;
    let lastDraw = 0;
    let compact = window.innerWidth < 640;
    let network = createBrainNetwork(compact);
    let points: ProjectedPoint[] = new Array(network.nodes.length);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      const nextCompact = width < 640;
      if (nextCompact !== compact) {
        compact = nextCompact;
        network = createBrainNetwork(compact);
        points = new Array(network.nodes.length);
      }
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
      const radius = Math.min(170, Math.max(92, width * 0.11));
      if (distance >= radius || distance === 0) return { x, y };
      const force = Math.pow(1 - distance / radius, 2) * (compact ? 42 : 64);
      return {
        x: x + (dx / distance) * force,
        y: y + (dy / distance) * force,
      };
    };

    const projectBrain = (time: number) => {
      const centerX = width / 2;
      const centerY = height * 0.47;
      const radius = Math.min(width * (compact ? 0.43 : 0.34), height * (compact ? 0.285 : 0.36));
      const morphRatio = Math.max(0, Math.min(1, (progressRef.current - 54) / 34));
      currentMorph = morphRatio * morphRatio * (3 - 2 * morphRatio);
      const calm = 1 - currentMorph;
      const breathe = reduced ? 1 : 1 + Math.sin(time * 0.0015) * 0.016 * calm;
      const turn = reduced ? 0.04 : Math.sin(time * 0.00042) * 0.11 * calm;
      const cosTurn = Math.cos(turn);
      const sinTurn = Math.sin(turn);

      network.nodes.forEach((node, index) => {
        const pulse = reduced ? 0 : Math.sin(time * 0.0011 + node.phase) * 0.016 * calm;
        const brainX = node.nx * (breathe + pulse);
        const brainY = node.ny * (breathe + pulse * 0.45);
        const sourceX = brainX + (node.tx - brainX) * currentMorph;
        const sourceY = brainY + (node.ty - brainY) * currentMorph;
        const sourceZ = node.nz * calm;
        const rotatedX = sourceX * cosTurn - sourceZ * sinTurn;
        const rotatedZ = sourceX * sinTurn + sourceZ * cosTurn;
        const perspective = 1 / (1.08 + rotatedZ * 0.12);
        const projectedX = centerX + rotatedX * radius * perspective;
        const projectedY = centerY + sourceY * radius * perspective;
        const disturbed = disturb(projectedX, projectedY);

        points[index] = { x: disturbed.x, y: disturbed.y, z: rotatedZ };
      });
    };

    const draw = (time: number) => {
      // Thirty canvas frames per second is visually smooth for this ambient
      // animation and leaves the main thread free to mount the portfolio.
      if (!reduced && time - lastDraw < 32) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastDraw = time;
      context.clearRect(0, 0, width, height);
      projectBrain(time);
      context.lineWidth = dark ? 0.72 : 0.86;

      const drawEdges = (edges: BrainEdge[], opacity: number) => {
        if (opacity <= 0.01) return;
        context.save();
        context.globalAlpha = opacity;
        for (const edge of edges) {
          const from = points[edge.from];
          const to = points[edge.to];
          const depth = Math.max(0, Math.min(1, ((from.z + to.z) / 2 + 0.42) / 0.84));
          const hue = 224 + depth * 54;
          const lineAlpha = (dark ? 0.1 : 0.12) + depth * (dark ? 0.24 : 0.18);
          context.strokeStyle = `hsla(${hue}, ${dark ? 94 : 82}%, ${dark ? 66 : 43}%, ${lineAlpha})`;
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
          context.stroke();
        }
        context.restore();
      };

      drawEdges(network.edges, 1 - currentMorph);
      drawEdges(network.monogramEdges, currentMorph);

      // Canvas shadowBlur per node is the single most expensive op here and is brutal on
      // browsers without GPU acceleration. Instead, fake the glow with a cheap faint
      // larger disc under each crisp core dot — additive blending ('lighter') in dark mode
      // makes overlapping halos bloom just like the old shadow, at a fraction of the cost.
      context.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      points.forEach((point, index) => {
        const depth = Math.max(0, Math.min(1, (point.z + 0.42) / 0.84));
        const signal = reduced ? 0 : (Math.sin(time * 0.003 + network.nodes[index].phase) + 1) / 2;
        const hue = 216 + depth * 70;
        const nodeRadius = 0.8 + depth * (dark ? 1.55 : 1.35) + signal * 0.35;
        const sat = dark ? 96 : 86;
        const light = dark ? 68 : 42;
        // soft glow halo (cheap — no shadowBlur)
        context.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${(dark ? 0.13 : 0.09) + depth * 0.1})`;
        context.beginPath();
        context.arc(point.x, point.y, nodeRadius * 2.6, 0, Math.PI * 2);
        context.fill();
        // crisp core
        context.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${0.48 + depth * 0.48})`;
        context.beginPath();
        context.arc(point.x, point.y, nodeRadius, 0, Math.PI * 2);
        context.fill();
      });
      context.globalCompositeOperation = 'source-over';

      // The pulsing center line keeps the two calm hemispheres clearly separated.
      const centerX = width / 2;
      const centerY = height * 0.47;
      const radius = Math.min(width * (compact ? 0.43 : 0.34), height * (compact ? 0.285 : 0.36));
      const fissureGlow = reduced ? 0.46 : 0.38 + (Math.sin(time * 0.002) + 1) * 0.1;
      const gradient = context.createLinearGradient(centerX, centerY - radius, centerX, centerY + radius);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.18, dark ? `rgba(129,140,248,${fissureGlow})` : `rgba(79,70,229,${fissureGlow})`);
      gradient.addColorStop(0.78, dark ? `rgba(168,85,247,${fissureGlow})` : `rgba(126,34,206,${fissureGlow})`);
      gradient.addColorStop(1, 'transparent');
      if (currentMorph < 0.94) {
        context.save();
        context.globalAlpha = 1 - currentMorph;
        context.strokeStyle = gradient;
        context.lineWidth = dark ? 1.3 : 1.15;
        context.beginPath();
        context.moveTo(centerX, centerY - radius * 0.88);
        context.bezierCurveTo(
          centerX - radius * 0.065,
          centerY - radius * 0.46,
          centerX + radius * 0.06,
          centerY + radius * 0.18,
          centerX,
          centerY + radius * 0.76,
        );
        context.stroke();
        context.restore();
      }

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

export function Loader({ onFinish, onExitStart }: { onFinish: () => void; onExitStart?: () => void }) {
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
    const runTime = reduced ? 320 : 4500;
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

      // Tell the app to mount the portfolio now, hidden behind this fading loader, so
      // the heavy first mount happens under cover instead of during the animation.
      onExitStart?.();
      setExiting(true);
      finishTimer = setTimeout(onFinish, reduced ? 60 : 500);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (finishTimer) clearTimeout(finishTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onFinish, onExitStart, reduced]);

  const activeStep = [...LOAD_STEPS].reverse().find((step) => progress >= step.at) ?? LOAD_STEPS[0];
  const activeMessage = messageOrder[Math.min(messageOrder.length - 1, Math.floor(progress / 21))];

  return (
    <motion.div
      className="fixed inset-0 z-[100] isolate overflow-hidden bg-[#f6f7fb] text-slate-950 dark:bg-[#030014] dark:text-white"
      role="status"
      aria-live="polite"
      aria-label={`${activeStep.label}, ${progress}%`}
      animate={exiting
        ? { opacity: 0, scale: 1.025 }
        : { opacity: 1, scale: 1 }}
      transition={{ duration: reduced ? 0.01 : 0.68, ease: [0.76, 0, 0.24, 1] }}
    >
      <div
        className="absolute inset-0 opacity-60 dark:opacity-80"
        style={{
          background: dark
            ? 'radial-gradient(circle at 50% 47%, rgba(99,102,241,.16), transparent 43%), radial-gradient(circle at 62% 53%, rgba(168,85,247,.1), transparent 36%)'
            : 'radial-gradient(circle at 50% 47%, rgba(99,102,241,.14), transparent 43%), radial-gradient(circle at 62% 53%, rgba(168,85,247,.08), transparent 36%)',
        }}
        aria-hidden="true"
      />

      <NeuralBrain dark={dark} reduced={reduced} progress={progress} />

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
          className="mt-3 text-[clamp(2.55rem,8vw,7rem)] font-bold leading-[0.86] tracking-[-0.065em] text-slate-950 [text-shadow:0_2px_24px_rgba(246,247,251,.95)] dark:text-white dark:[text-shadow:0_2px_28px_rgba(3,0,20,.96)]"
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
