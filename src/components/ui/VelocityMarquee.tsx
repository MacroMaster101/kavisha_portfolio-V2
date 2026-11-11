import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'framer-motion';

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// A row that keeps drifting sideways. The page scroll steers it: after scrolling down it
// travels left, after scrolling up it travels right, and it speeds up while the page is
// moving. `speed` is the resting pace in px per second. Pauses while off screen.
function Row({
  children,
  speed,
  boost,
  direction,
}: {
  children: ReactNode;
  speed: number;
  /** Signed scroll speed, -5..5 (positive = scrolling down). */
  boost: MotionValue<number>;
  /** Shared travel direction: 1 = left, -1 = right. */
  direction: RefObject<number>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(3);
  const unit = useMotionValue(0);
  const offset = useMotionValue(0);
  const visible = useRef(true);
  const reduced = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const block = blockRef.current;
    if (!container || !block) return;
    const measure = () => {
      const bw = block.scrollWidth;
      unit.set(bw);
      const next = bw > 0 ? Math.max(3, Math.ceil(container.offsetWidth / bw) + 2) : 3;
      setCopies((prev) => (prev === next ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(block);
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    });
    io.observe(container);
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [unit]);

  useAnimationFrame((_, delta) => {
    if (!visible.current || document.hidden) return;
    const vf = reduced.current ? 0 : Math.min(5, Math.abs(boost.get()));
    offset.set(offset.get() + direction.current * speed * (1 + vf * 1.6) * (delta / 1000));
  });

  const x = useTransform([offset, unit], ([o, w]) => `${-wrap(0, Number(w) || 1, Number(o) || 0)}px`);

  return (
    <div ref={containerRef} className="w-full overflow-hidden whitespace-nowrap">
      <motion.div className="inline-flex transform-gpu items-center will-change-transform select-none" style={{ x }}>
        {Array.from({ length: copies }, (_, i) => (
          <div key={i} ref={i === 0 ? blockRef : null} aria-hidden={i !== 0} className="inline-flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const ROW_A = ['TypeScript', 'React', 'Next.js', 'React Native', 'Supabase', 'PostgreSQL', 'Electron'];
const ROW_B = ['Python', 'AI / ML', 'C# / .NET', 'Docker', 'GitHub Actions', 'Drizzle ORM', 'Expo'];

function Item({ label, outline }: { label: string; outline?: boolean }) {
  return (
    <span className="inline-flex items-center">
      <span
        className={`px-4 text-2xl font-extrabold uppercase tracking-tight sm:text-4xl md:text-5xl ${
          outline ? 'text-outline' : 'text-slate-400/70 dark:text-slate-700/70'
        }`}
      >
        {label}
      </span>
      <span className="text-lg text-brand-primary/60 sm:text-2xl">✦</span>
    </span>
  );
}

// Two rows of the tech stack between the hero and About. The band lies flat at rest and
// tilts with the scroll: scrolling up raises its right end, scrolling down lowers it,
// and it levels out again when the page stops. The rows drift left by default; scrolling
// down sends them left and scrolling up sends them right (they keep going that way),
// faster while the page moves. Decorative: the same skills are listed in Skills.
export function VelocityMarquee() {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smooth, (v) => (v < 0 ? -1 : 1) * Math.min(5, (Math.abs(v) / 1000) * 5));
  const tilt = useSpring(useTransform(smooth, [-700, 0, 700], [-6, 0, 6]), { stiffness: 140, damping: 22 });
  const direction = useRef(1);

  // Steer from the raw scroll velocity so the direction flips as soon as the page does.
  useEffect(
    () =>
      velocity.on('change', (v) => {
        if (Math.abs(v) > 20) direction.current = v > 0 ? 1 : -1;
      }),
    [velocity],
  );

  return (
    <div aria-hidden className="relative overflow-x-clip pt-10 pb-2 sm:pt-14 sm:pb-0">
      <motion.div
        style={{ rotate: tilt }}
        className="space-y-1 border-y border-slate-300/60 bg-white/70 py-4 shadow-[0_10px_30px_-18px_rgba(2,12,27,0.25)] backdrop-blur-[2px] [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] dark:border-white/[0.06] dark:bg-white/[0.015]"
      >
        <Row speed={60} boost={boost} direction={direction}>
          {ROW_A.map((s) => <Item key={s} label={s} />)}
        </Row>
        <Row speed={42} boost={boost} direction={direction}>
          {ROW_B.map((s) => <Item key={s} label={s} outline />)}
        </Row>
      </motion.div>
    </div>
  );
}
