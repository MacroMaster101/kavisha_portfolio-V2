import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../contexts/useTheme';

/**
 * Full-screen intro loader. A "KL" monogram sits inside an orbital system:
 * a conic progress ring (the real load indicator), two faint counter-rotating
 * rings, a pulsing halo, and a shimmer sweep across the letters. Progress eases
 * toward 90%, snaps to 100% on window `load`, then fades out and unmounts.
 * Sizing uses clamp() so it scales cleanly on mobile; respects reduced-motion.
 */
export function Loader({ onFinish }: { onFinish: () => void }) {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  // Lock scroll while the loader is visible.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Drive progress: ease toward 90% on a timer, finish on window load.
  useEffect(() => {
    let finished = false;

    const tick = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.max(1, Math.round((90 - p) * 0.08))));
    }, 90);

    const complete = () => {
      if (finished) return;
      finished = true;
      clearInterval(tick);
      setProgress(100);
      setTimeout(() => setExiting(true), 400);
    };

    if (document.readyState === 'complete') {
      const t = setTimeout(complete, 750);
      return () => {
        clearInterval(tick);
        clearTimeout(t);
      };
    }

    window.addEventListener('load', complete);
    return () => {
      clearInterval(tick);
      window.removeEventListener('load', complete);
    };
  }, []);

  const isDark = theme === 'dark';
  const bg = isDark ? '#030014' : '#ffffff';
  const ringTrack = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const nameColor = isDark ? '#ffffff' : '#0f172a';
  const subColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)';
  const deg = progress * 3.6;

  const spin = (reverse = false) =>
    reduce ? undefined : { rotate: reverse ? -360 : 360 };

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: bg }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Orbital system */}
          <div
            className="relative flex items-center justify-center"
            style={{
              width: 'clamp(180px, 60vw, 280px)',
              height: 'clamp(180px, 60vw, 280px)',
            }}
          >
            {/* Pulsing halo */}
            <motion.div
              aria-hidden
              className="absolute rounded-full"
              style={{
                inset: '-15%',
                background:
                  'radial-gradient(circle, var(--brand-primary-glow) 0%, transparent 62%)',
                filter: 'blur(14px)',
              }}
              animate={reduce ? { opacity: 0.2 } : { scale: [0.9, 1.1, 0.9], opacity: [0.14, 0.3, 0.14] }}
              transition={{ duration: 2.8, ease: 'easeInOut', repeat: reduce ? 0 : Infinity }}
            />

            {/* Conic progress ring */}
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(var(--brand-primary) 0deg, var(--brand-secondary) ${deg}deg, ${ringTrack} ${deg}deg)`,
                WebkitMask:
                  'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
                filter: 'drop-shadow(0 0 6px var(--brand-primary-glow))',
              }}
            />

            {/* Two faint counter-rotating rings with orbiting dots */}
            <motion.div
              aria-hidden
              className="absolute rounded-full"
              style={{ inset: '12%', border: '1px solid var(--brand-primary-glow)', opacity: 0.14 }}
              animate={spin()}
              transition={{ duration: 8, ease: 'linear', repeat: reduce ? 0 : Infinity }}
            >
              <span
                className="absolute left-1/2 -translate-x-1/2 rounded-full"
                style={{ top: -3, width: 6, height: 6, background: 'var(--brand-primary)', boxShadow: '0 0 12px 2px var(--brand-primary)' }}
              />
            </motion.div>
            <motion.div
              aria-hidden
              className="absolute rounded-full"
              style={{ inset: '24%', border: '1px dashed var(--brand-primary-glow)', opacity: 0.1 }}
              animate={spin(true)}
              transition={{ duration: 12, ease: 'linear', repeat: reduce ? 0 : Infinity }}
            >
              <span
                className="absolute left-1/2 -translate-x-1/2 rounded-full"
                style={{ top: -3, width: 6, height: 6, background: 'var(--brand-secondary)', boxShadow: '0 0 12px 2px var(--brand-secondary)' }}
              />
            </motion.div>

            {/* KL monogram with shimmer sweep */}
            <div
              className="relative z-[2] flex font-sans font-black tracking-tighter leading-none"
              style={{ fontSize: 'clamp(48px, 13vw, 84px)' }}
            >
              {['K', 'L'].map((ch, i) => (
                <motion.span
                  key={ch}
                  className="inline-block bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                    textShadow: '0 0 40px var(--brand-primary-glow)',
                  }}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {ch}
                </motion.span>
              ))}
              {!reduce && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-[3]"
                  style={{
                    backgroundImage:
                      'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)',
                    backgroundSize: '250% 100%',
                    mixBlendMode: 'overlay',
                  }}
                  animate={{ backgroundPosition: ['150% 0', '-50% 0'] }}
                  transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.4 }}
                />
              )}
            </div>
          </div>

          {/* Caption */}
          <div
            className="z-[2] flex flex-col items-center gap-2"
            style={{ marginTop: 'clamp(22px, 5vw, 34px)' }}
          >
            <span className="font-sans font-bold" style={{ fontSize: 'clamp(13px, 3.4vw, 15px)', color: nameColor }}>
              Kavisha Liyanage
            </span>
            <span
              className="font-mono uppercase"
              style={{ fontSize: 11, letterSpacing: '0.12em', color: subColor }}
            >
              Loading{' '}
              <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{progress}%</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
