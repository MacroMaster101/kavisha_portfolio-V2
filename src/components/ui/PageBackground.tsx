import { motion } from 'framer-motion';

// Ambient site-wide background: subtle grid + drifting brand-tinted glows + a few floating dots.
// Lives at the page root so the look is continuous across sections.
export function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden>
      {/* Subtle grid — slate-toned, very faint */}
      <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18] bg-[linear-gradient(to_right,rgb(148_163_184/0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgb(148_163_184/0.15)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_30%,transparent_95%)]" />

      {/* Two soft brand glows that drift slowly */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] -left-40 w-[520px] h-[520px] rounded-full bg-brand-primary/[0.07] dark:bg-brand-primary/[0.09] blur-[140px]"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute top-[40%] -right-40 w-[440px] h-[440px] rounded-full bg-brand-primary/[0.05] dark:bg-brand-primary/[0.07] blur-[140px]"
      />

      {/* Quiet floating dots */}
      {[...Array(10)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-slate-400/30 dark:bg-slate-500/25"
          style={{
            left: `${(i * 53) % 100}%`,
            top: `${(i * 71) % 100}%`,
          }}
          animate={{
            y: [0, -16, 0],
            opacity: [0.15, 0.45, 0.15],
          }}
          transition={{
            duration: 5 + (i % 4),
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
