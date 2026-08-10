import { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../contexts/useTheme';

class Particle {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
  ease: number;
  friction: number = 0.88;

  constructor(targetX: number, targetY: number, color: string, startX: number, startY: number) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.x = startX;
    this.y = startY;
    this.color = color;
    this.size = Math.random() * 1.6 + 1.2;
    // Add slight organic variation to springiness
    this.ease = 0.04 + Math.random() * 0.03;
  }

  update(mouseX: number | null, mouseY: number | null, repulsionRadius: number, repulsionForce: number) {
    // 1. Force towards target
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    
    this.vx += dx * this.ease;
    this.vy += dy * this.ease;

    // Apply friction/drag
    this.vx *= this.friction;
    this.vy *= this.friction;

    // 2. Mouse Repulsion
    if (mouseX !== null && mouseY !== null) {
      const mdx = this.x - mouseX;
      const mdy = this.y - mouseY;
      const distSq = mdx * mdx + mdy * mdy;
      const dist = Math.sqrt(distSq);

      if (dist < repulsionRadius) {
        // Calculate repulsion direction
        const dirX = mdx / (dist || 1);
        const dirY = mdy / (dist || 1);
        // Force decreases with distance
        const ratio = (repulsionRadius - dist) / repulsionRadius;
        const pushForce = ratio * repulsionForce;
        
        // Push particle away
        this.vx += dirX * pushForce;
        this.vy += dirY * pushForce;
      }
    }

    // 3. Move particle
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  scatter(centerX: number, centerY: number) {
    const dx = this.x - centerX;
    const dy = this.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const burst = 0.7 + this.ease * 5;
    this.vx = (this.vx + (dx / distance) * burst) * 0.985;
    this.vy = (this.vy + (dy / distance) * burst - 0.025) * 0.985;
    this.x += this.vx;
    this.y += this.vy;
  }
}

/**
 * Scans an offscreen canvas to find pixel coordinates representing the monogram "KL".
 */
const scanText = (width: number, height: number): { x: number; y: number }[] => {
  const offscreen = document.createElement('canvas');
  const octx = offscreen.getContext('2d');
  if (!octx) return [];

  offscreen.width = width;
  offscreen.height = height;
  octx.clearRect(0, 0, width, height);

  // Responsive font size calculations
  const fontSize = Math.min(220, Math.max(80, Math.round(width * 0.12)));

  octx.fillStyle = '#000000';
  // Use Inter font with high weight for solid particle structure
  octx.font = `900 ${fontSize}px Inter, sans-serif`;
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';

  // Draw the initials KL centered
  // Leave the lower half clear for the invitation and entry control.
  octx.fillText('KL', width / 2, height * (width < 640 ? 0.34 : 0.32));

  const imgData = octx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const points: { x: number; y: number }[] = [];

  // Keep the mark crisp without overloading lower-powered mobile GPUs.
  const step = width < 768 ? 5 : 6;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 128) {
        points.push({ x, y });
      }
    }
  }

  return points;
};

/**
 * Returns a theme-appropriate particle color mapped along the x-axis.
 */
const getParticleColor = (x: number, width: number, isDark: boolean): string => {
  const ratio = x / width;
  if (isDark) {
    // Gradient between Indigo (#6366f1) and Purple (#a855f7)
    const r = Math.round(99 + (168 - 99) * ratio);
    const g = Math.round(102 + (85 - 102) * ratio);
    const b = Math.round(241 + (247 - 241) * ratio);
    return `rgba(${r}, ${g}, ${b}, 0.85)`;
  } else {
    // Gradient between dark Indigo (#312e81) and Slate (#475569)
    const r = Math.round(49 + (71 - 49) * ratio);
    const g = Math.round(46 + (85 - 46) * ratio);
    const b = Math.round(129 + (105 - 129) * ratio);
    return `rgba(${r}, ${g}, ${b}, 0.85)`;
  }
};

/**
 * Draws connecting lines between close particles (constellation net effect).
 */
const drawConstellation = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  maxDistance: number,
  isDark: boolean
) => {
  const lineOpacityBase = isDark ? 0.12 : 0.08;
  const strokeColor = isDark ? '99, 102, 241' : '49, 46, 129';
  const grid = new Map<string, number[]>();

  // Spatial hashing limits comparisons to neighboring cells instead of checking
  // every particle against every other particle on every animation frame.
  particles.forEach((particle, index) => {
    const cellX = Math.floor(particle.x / maxDistance);
    const cellY = Math.floor(particle.y / maxDistance);
    const key = `${cellX},${cellY}`;
    const cell = grid.get(key);
    if (cell) cell.push(index);
    else grid.set(key, [index]);
  });

  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i];
    const cellX = Math.floor(p1.x / maxDistance);
    const cellY = Math.floor(p1.y / maxDistance);

    for (let offsetY = -1; offsetY <= 1; offsetY++) {
      for (let offsetX = -1; offsetX <= 1; offsetX++) {
        const nearby = grid.get(`${cellX + offsetX},${cellY + offsetY}`);
        if (!nearby) continue;

        for (const j of nearby) {
          if (j <= i) continue;
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistance * maxDistance) {
            const dist = Math.sqrt(distSq);
            const opacity = (1 - dist / maxDistance) * lineOpacityBase;
            ctx.strokeStyle = `rgba(${strokeColor}, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    }
  }
};

export function Loader({ onFinish }: { onFinish: () => void }) {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const openingRef = useRef(false);

  useEffect(() => {
    openingRef.current = opening;
  }, [opening]);

  // Lock body scroll while loader is active
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Assemble the mark quickly, then hand control to the visitor.
  useEffect(() => {
    const totalDuration = 900;
    const intervalTime = 25;
    const totalSteps = totalDuration / intervalTime;
    let step = 0;
    let loadFallbackTimer: ReturnType<typeof setTimeout> | undefined;
    let finished = false;

    const finalize = () => {
      if (finished) return;
      finished = true;
      setProgress(100);
      setReady(true);
    };

    const tick = setInterval(() => {
      step++;
      const currentProgress = Math.min(99, Math.round((step / totalSteps) * 100));
      setProgress(currentProgress);

      if (step >= totalSteps) {
        clearInterval(tick);

        if (document.readyState === 'complete') {
          finalize();
        } else {
          window.addEventListener('load', finalize, { once: true });
          loadFallbackTimer = setTimeout(finalize, 1200);
        }
      }
    }, intervalTime);

    return () => {
      clearInterval(tick);
      if (loadFallbackTimer) clearTimeout(loadFallbackTimer);
      window.removeEventListener('load', finalize);
    };
  }, []);

  useEffect(() => {
    if (ready) startButtonRef.current?.focus({ preventScroll: true });
  }, [ready]);

  useEffect(() => {
    if (!opening) return;
    const finishTimer = setTimeout(onFinish, 1250);
    return () => clearTimeout(finishTimer);
  }, [onFinish, opening]);

  const openPortfolio = () => {
    if (!ready || opening) return;
    setOpening(true);
  };

  const isDark = theme === 'dark';
  const bg = isDark ? '#030014' : '#ffffff';
  const nameColor = isDark ? '#ffffff' : '#0f172a';
  const subColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  // Core Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;

      const points = scanText(w, h);

      // Re-map or spawn particles
      const newParticles: Particle[] = [];
      points.forEach((pt, idx) => {
        const color = getParticleColor(pt.x, w, isDark);
        if (particles[idx]) {
          const oldP = particles[idx];
          oldP.targetX = pt.x;
          oldP.targetY = pt.y;
          oldP.color = color;
          newParticles.push(oldP);
        } else {
          // Spawn from off-screen or random point
          const startX = Math.random() * w;
          const startY = Math.random() * h;
          newParticles.push(new Particle(pt.x, pt.y, color, startX, startY));
        }
      });
      particles = newParticles;
    };

    handleResize();

    // Listen to resize and font load triggers to re-scan text coordinate shape
    window.addEventListener('resize', handleResize);
    let disposed = false;
    document.fonts.ready.then(() => { if (!disposed) handleResize(); });

    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const clearPointer = () => {
      mouseRef.current = { x: null, y: null };
    };

    const handlePointerEnd = (e: PointerEvent) => {
      // A mouse can continue hovering after release; a finger cannot.
      if (e.pointerType !== 'mouse') clearPointer();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    canvas.addEventListener('pointerleave', clearPointer);
    window.addEventListener('pointerup', handlePointerEnd, { passive: true });
    window.addEventListener('pointercancel', handlePointerEnd, { passive: true });

    // Animation Loop
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isMobile = canvas.width < 768;
      const maxLineDist = isMobile ? 22 : 32;
      const repulsionRadius = isMobile ? 60 : 90;
      const repulsionForce = isMobile ? 3.0 : 5.0;

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // Draw cursor repulsion hover glow
      if (!reduce && mouseX !== null && mouseY !== null) {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, repulsionRadius, 0, Math.PI * 2);
        const glowGradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, repulsionRadius);
        if (isDark) {
          glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
          glowGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        } else {
          glowGradient.addColorStop(0, 'rgba(49, 46, 129, 0.05)');
          glowGradient.addColorStop(1, 'rgba(49, 46, 129, 0)');
        }
        ctx.fillStyle = glowGradient;
        ctx.fill();
      }

      // Update and draw particles
      particles.forEach((p) => {
        if (openingRef.current && !reduce) {
          p.scatter(canvas.width / 2, canvas.height * (isMobile ? 0.34 : 0.32));
        } else if (!reduce) {
          p.update(mouseX, mouseY, repulsionRadius, repulsionForce);
        } else {
          // Snap directly if user prefers reduced motion
          p.x = p.targetX;
          p.y = p.targetY;
        }
        p.draw(ctx);
      });

      // Draw constellation connections
      drawConstellation(ctx, particles, maxLineDist, isDark);

      if (!reduce) animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', clearPointer);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [isDark, reduce]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
    >
      {/* The background dissolves so the already-loaded portfolio can blend through. */}
      <motion.div
        className="absolute inset-0"
        style={{ background: bg }}
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 1.05, delay: opening ? 0.12 : 0, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        className="absolute inset-0 z-[1]"
        animate={{
          opacity: opening ? 0 : 1,
          scale: opening ? 1.16 : 1,
          filter: opening ? 'blur(12px)' : 'blur(0px)',
        }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        {/* Lightweight aurora clouds add depth without loading image assets. */}
        <motion.div
          className="absolute -left-[12vw] top-[8%] h-[42vw] min-h-72 w-[42vw] min-w-72 rounded-full will-change-transform"
          style={{ background: `radial-gradient(circle, ${isDark ? 'rgba(79,70,229,.34)' : 'rgba(99,102,241,.25)'} 0%, transparent 70%)` }}
          animate={opening ? { x: '-42%', y: '-18%', scale: 1.5, opacity: 0 } : reduce ? undefined : { x: ['0%', '14%', '0%'], y: ['0%', '9%', '0%'], scale: [1, 1.12, 1] }}
          transition={opening ? { duration: 0.95, ease: [0.22, 1, 0.36, 1] } : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-[10vw] bottom-[2%] h-[38vw] min-h-64 w-[38vw] min-w-64 rounded-full will-change-transform"
          style={{ background: `radial-gradient(circle, ${isDark ? 'rgba(168,85,247,.3)' : 'rgba(168,85,247,.22)'} 0%, transparent 70%)` }}
          animate={opening ? { x: '40%', y: '22%', scale: 1.45, opacity: 0 } : reduce ? undefined : { x: ['0%', '-12%', '0%'], y: ['0%', '-12%', '0%'], scale: [1.08, 0.96, 1.08] }}
          transition={opening ? { duration: 1.05, ease: [0.22, 1, 0.36, 1] } : { duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-[34%] top-[28%] h-64 w-64 rounded-full will-change-transform"
          style={{ background: `radial-gradient(circle, ${isDark ? 'rgba(56,189,248,.16)' : 'rgba(56,189,248,.12)'} 0%, transparent 68%)` }}
          animate={opening ? { y: '-35%', scale: 1.6, opacity: 0 } : reduce ? undefined : { x: ['-8%', '18%', '-8%'], y: ['8%', '-12%', '8%'] }}
          transition={opening ? { duration: 1, ease: [0.22, 1, 0.36, 1] } : { duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(148,163,184,.12)' : 'rgba(99,102,241,.1)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(148,163,184,.12)' : 'rgba(99,102,241,.1)'} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(circle at center, black, transparent 72%)',
          }}
        />

        {/* A scalable network fills the viewport while staying visually quiet. */}
        <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="loader-network" x1="0" y1="0" x2="1440" y2="900" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" stopOpacity={isDark ? 0.42 : 0.28} />
              <stop offset="0.5" stopColor="#a855f7" stopOpacity={isDark ? 0.26 : 0.18} />
              <stop offset="1" stopColor="#38bdf8" stopOpacity={isDark ? 0.38 : 0.22} />
            </linearGradient>
          </defs>
          <motion.path d="M-40 180 C170 80 290 260 470 170 S760 70 920 190 S1210 300 1480 120" stroke="url(#loader-network)" strokeWidth="1" strokeDasharray="5 11" animate={reduce ? undefined : { strokeDashoffset: [0, -64] }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} />
          <motion.path d="M-60 690 C180 560 320 760 540 650 S870 500 1040 650 S1260 760 1500 600" stroke="url(#loader-network)" strokeWidth="1" strokeDasharray="3 13" animate={reduce ? undefined : { strokeDashoffset: [0, 64] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
          <path d="M130 180 L260 360 L125 610 M1310 165 L1175 340 L1315 650" stroke="url(#loader-network)" strokeWidth="1" opacity=".55" />
          {[[130,180],[260,360],[125,610],[1310,165],[1175,340],[1315,650],[390,135],[1040,720]].map(([cx, cy], index) => (
            <motion.circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index % 3 === 0 ? 4 : 2.5} fill={index % 2 ? '#a855f7' : '#6366f1'}
              animate={reduce ? undefined : { opacity: [0.3, 0.9, 0.3], scale: [1, 1.5, 1] }}
              transition={{ duration: 2.8 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </svg>

        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(129,140,248,.32)' : 'rgba(99,102,241,.25)'} 1px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            maskImage: 'radial-gradient(ellipse at center, transparent 5%, black 42%, transparent 82%)',
          }}
        />

        <motion.div
          className="absolute left-[4%] top-[22%] select-none font-mono text-[clamp(72px,11vw,170px)] font-light leading-none text-brand-primary/[0.07] dark:text-brand-primary/[0.1]"
          animate={reduce ? undefined : { y: [0, -12, 0], rotate: [-2, 1, -2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {'</>'}
        </motion.div>
        <motion.div
          className="absolute bottom-[16%] right-[5%] select-none font-mono text-[clamp(88px,13vw,190px)] font-light leading-none text-brand-secondary/[0.07] dark:text-brand-secondary/[0.1]"
          animate={reduce ? undefined : { y: [0, 14, 0], rotate: [2, -1, 2] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          {'{ }'}
        </motion.div>

        <motion.div
          className="absolute left-[9%] top-[58%] h-24 w-24 rotate-12 rounded-[28px] border border-brand-primary/15 sm:h-36 sm:w-36"
          animate={reduce ? undefined : { y: [0, -14, 0], rotate: [12, 18, 12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute inset-3 rounded-[21px] border border-brand-secondary/10 sm:inset-5" />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-brand-primary shadow-[0_0_14px_var(--brand-primary-glow)]" />
        </motion.div>
        <motion.div
          className="absolute bottom-[9%] right-[19%] h-16 w-16 rotate-45 rounded-2xl border border-brand-secondary/15 sm:h-24 sm:w-24"
          animate={reduce ? undefined : { y: [0, 12, 0], rotate: [45, 37, 45] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <canvas
          ref={canvasRef}
          className="relative h-full w-full touch-none"
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-between px-6 py-8 sm:py-10 md:py-12"
        animate={{ opacity: opening ? 0 : 1, scale: opening ? 1.1 : 1, filter: opening ? 'blur(10px)' : 'blur(0px)' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex w-full max-w-6xl items-center justify-end font-mono text-[9px] uppercase tracking-[0.2em] sm:text-[10px]" style={{ color: subColor }}>
          <span aria-hidden="true">Kavisha / Portfolio 2026</span>
        </div>

        <div className="pointer-events-auto flex flex-col items-center gap-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex flex-col items-center gap-5"
          >
            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] sm:text-[10px]" style={{ color: subColor }}>
                Digital experiences, thoughtfully built
              </p>
              <h1 id="intro-title" className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: nameColor }}>
                Kavisha Liyanage
              </h1>
            </div>

            <button
              ref={startButtonRef}
              type="button"
              onClick={openPortfolio}
              disabled={!ready || opening}
              className="group relative inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-full bg-brand-primary px-7 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_0_35px_var(--brand-primary-glow)] transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-[0_0_50px_var(--brand-primary-glow-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary disabled:cursor-wait disabled:opacity-0"
              aria-label="Get started and open Kavisha Liyanage's portfolio"
            >
              <span>Get Started</span>
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none">
                <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] sm:text-[9px]" style={{ color: subColor }}>
              Move your cursor or drag across KL
            </p>
          </motion.div>
        </div>

        <div className="flex w-full max-w-6xl items-end justify-between">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] sm:text-[10px]" style={{ color: subColor }} aria-live="polite">
            {ready ? 'Ready to explore' : `Preparing experience ${progress}%`}
          </div>
          <div className="h-px w-20 overflow-hidden rounded-full sm:w-32" style={{ background: isDark ? 'rgba(255,255,255,.1)' : 'rgba(15,23,42,.12)' }} aria-hidden="true">
            <motion.div
              className="h-full bg-brand-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.12, ease: 'linear' }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[3] h-[18vmax] w-[18vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-primary/30"
        initial={{ opacity: 0, scale: 0.25 }}
        animate={opening ? { opacity: [0, 0.7, 0], scale: [0.25, 3.8, 5] } : { opacity: 0, scale: 0.25 }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
