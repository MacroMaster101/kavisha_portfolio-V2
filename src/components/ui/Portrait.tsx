import { useRef, type PointerEvent, type ReactNode } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

// The About portrait. It wipes in from the bottom as it scrolls into view, drifts a
// little inside its frame as the page scrolls (parallax), and tilts toward the pointer
// in 3D with a soft glare that follows it. Behind it, an offset frame with a slowly
// turning gradient edge. `children` are the floating badges, positioned over the frame
// (outside the tilt, so they stay crisp).
// Reduced motion keeps the reveal as a plain fade and skips the tilt and parallax.
export function Portrait({ src, alt, children }: { src: string; alt: string; children?: ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Pointer position over the card, 0..1 on each axis (0.5 = centre).
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [8, -8]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-10, 10]), spring);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.28), transparent 55%)`;

  // Parallax: the photo slides up a little inside its frame while the section scrolls by.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div ref={ref} className="relative [perspective:900px]">
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        // The entrance runs from here: the photo starts fully clipped, and a clipped
        // element never reports itself in view, so it can't trigger its own reveal.
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.4 }}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative"
      >
        {/* Offset frame with a turning gradient edge */}
        <motion.div
          aria-hidden
          variants={{ hidden: { opacity: 0, x: 0, y: 0 }, shown: { opacity: 1, x: 16, y: 16 } }}
          transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
          style={reduce ? undefined : { translateZ: -30 }}
          className="absolute inset-0 overflow-hidden rounded-2xl p-[2px]"
        >
          <span className="absolute inset-[-60%] animate-[bot-ring_8s_linear_infinite] bg-[conic-gradient(from_0deg,var(--brand-primary),#22d3ee,var(--brand-secondary),var(--brand-primary))]" />
          <span className="relative block h-full w-full rounded-[14px] bg-page dark:bg-page-dark" />
        </motion.div>

        {/* Photo: wipes up into view, then drifts with the scroll */}
        <motion.div
          variants={
            reduce
              ? { hidden: { opacity: 0 }, shown: { opacity: 1 } }
              : { hidden: { clipPath: 'inset(100% 0% 0% 0% round 16px)' }, shown: { clipPath: 'inset(0% 0% 0% 0% round 16px)' } }
          }
          transition={{ duration: 1.1, ease: EASE }}
          className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-800 shadow-[0_30px_60px_-25px_rgba(2,12,27,0.55)]"
        >
          <motion.img
            src={src}
            alt={alt}
            width={900}
            height={1125}
            loading="lazy"
            decoding="async"
            variants={reduce ? undefined : { hidden: { scale: 1.2 }, shown: { scale: 1.08 } }}
            transition={{ duration: 1.4, ease: EASE }}
            style={reduce ? undefined : { y: photoY }}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          {/* Brand-tinted shade at the foot of the photo, lifting on hover */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-primary/35 to-transparent transition-opacity duration-500 group-hover:opacity-40" />
          {/* Glare that follows the pointer */}
          {!reduce && (
            <motion.span
              aria-hidden
              style={{ backgroundImage: glare }}
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
          {/* One light sweep across the photo after it reveals */}
          {!reduce && (
            <motion.span
              aria-hidden
              variants={{ hidden: { x: '-120%' }, shown: { x: '220%' } }}
              transition={{ duration: 1.2, delay: 1, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
          )}
        </motion.div>

      </motion.div>

      {/* Badges sit outside the tilting layer: anything inside a 3D transform is drawn
          as a texture, which blurs small text and icons. */}
      <div className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto">{children}</div>
    </div>
  );
}
