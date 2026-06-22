import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  octx.fillText('KL', width / 2, height / 2);

  const imgData = octx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const points: { x: number; y: number }[] = [];

  // Sampling step: denser particles on smaller viewports, sparser on large screens for performance
  const step = width < 768 ? 4 : 6;

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

  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
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
};

export function Loader({ onFinish }: { onFinish: () => void }) {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  // Lock body scroll while loader is active
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Drive progress bar / loading trigger with guaranteed display duration (minimum 3.2 seconds)
  useEffect(() => {
    const totalDuration = 3200; // 3.2 seconds minimum display time
    const intervalTime = 30; // Update progress every 30ms
    const totalSteps = totalDuration / intervalTime;
    let step = 0;

    const tick = setInterval(() => {
      step++;
      const currentProgress = Math.min(99, Math.round((step / totalSteps) * 100));
      setProgress(currentProgress);

      if (step >= totalSteps) {
        clearInterval(tick);

        const finalize = () => {
          setProgress(100);
          setTimeout(() => setExiting(true), 800);
        };

        // If the window is fully loaded, transition to 100% immediately
        if (document.readyState === 'complete') {
          finalize();
        } else {
          // Otherwise, wait for the window load event to complete the transition
          window.addEventListener('load', finalize, { once: true });
        }
      }
    }, intervalTime);

    return () => {
      clearInterval(tick);
    };
  }, []);

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
    document.fonts.ready.then(handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

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
        if (!reduce) {
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

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDark, reduce]);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: bg }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Interactive particles canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full block touch-none z-[1]"
          />

          {/* Core Info Overlay */}
          <div
            className="pointer-events-none z-[2] absolute bottom-12 md:bottom-16 flex flex-col items-center gap-2 select-none"
          >
            <span
              className="font-sans font-bold tracking-tight text-center"
              style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: nameColor }}
            >
              Kavisha Liyanage
            </span>
            <span
              className="font-mono uppercase"
              style={{ fontSize: 10, letterSpacing: '0.14em', color: subColor }}
            >
              Loading{' '}
              <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                {progress}%
              </span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

