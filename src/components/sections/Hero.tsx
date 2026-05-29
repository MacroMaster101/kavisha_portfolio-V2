import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Mail } from 'lucide-react';

// Lazy-load Spline so it doesn't bloat the initial bundle.
const Spline = lazy(() => import('@splinetool/react-spline'));

// Public Spline scene — interactive robot that follows the cursor.
// To swap: go to spline.design → open a community scene → click "Export" → "Code Export" → copy the .splinecode URL.
const SPLINE_ROBOT = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

const roles = [
  'intelligent things for the web.',
  'AI-powered applications.',
  'full-stack mobile apps.',
  'secure REST APIs.',
  'machine learning models.',
];

function useTypewriter(words: string[], typeMs = 70, holdMs = 1800, eraseMs = 35) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'erasing'>('typing');

  useEffect(() => {
    const current = words[wordIdx];
    let t: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (text.length < current.length) {
        t = setTimeout(() => setText(current.slice(0, text.length + 1)), typeMs);
      } else {
        t = setTimeout(() => setPhase('erasing'), holdMs);
      }
    } else if (phase === 'erasing') {
      if (text.length > 0) {
        t = setTimeout(() => setText(text.slice(0, -1)), eraseMs);
      } else {
        t = setTimeout(() => {
          setWordIdx((wordIdx + 1) % words.length);
          setPhase('typing');
        }, eraseMs);
      }
    }
    return () => clearTimeout(t);
  }, [text, phase, wordIdx, words, typeMs, holdMs, eraseMs]);

  return text;
}

export function Hero() {
  const typed = useTypewriter(roles);

  // Spline tracks the cursor only while the pointer is over its own canvas. To make
  // the robot follow the mouse across the entire hero header, we grab the canvas on
  // load and re-dispatch pointer moves onto it from the section-level handler below.
  const splineCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSplineLoad = useCallback(() => {
    // The Spline component renders a <canvas>; locate it so we can forward events.
    splineCanvasRef.current = document.querySelector('#hero canvas');
  }, []);

  // Forward a mousemove anywhere in the header to the Spline canvas at the same
  // screen coordinates, so the robot reacts as if the cursor were over it.
  // Both the mobile and desktop canvases live in the DOM; pick whichever is
  // currently visible (the hidden one has no offsetParent).
  const handleHeaderMouseMove = useCallback((e: React.MouseEvent) => {
    const canvases = document.querySelectorAll<HTMLCanvasElement>('#hero canvas');
    const canvas = Array.from(canvases).find((c) => c.offsetParent !== null) ?? splineCanvasRef.current;
    if (!canvas) return;
    canvas.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
        cancelable: true,
      })
    );
  }, []);

  // The Spline robot canvas, reused in two spots: inline on mobile (between the
  // tagline and description) and in the right column on desktop.
  const robotCanvas = (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-brand-primary/30 border-t-brand-primary animate-spin" />
        </div>
      }
    >
      <Spline scene={SPLINE_ROBOT} onLoad={handleSplineLoad} />
    </Suspense>
  );

  // Decorative background behind the robot: radial glow + faint grid + dot pattern.
  const robotBackdrop = (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(99,102,241,0.28),rgba(168,85,247,0.10)_45%,transparent_72%)]" />
      <div
        className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,#000_30%,transparent_75%)] dark:opacity-100 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.10) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,#000_20%,transparent_70%)]"
        style={{
          backgroundImage: 'radial-gradient(rgba(168,85,247,0.22) 1px, transparent 1.4px)',
          backgroundSize: '16px 16px',
        }}
      />
    </>
  );

  return (
    <section
      id="hero"
      onMouseMove={handleHeaderMouseMove}
      className="relative min-h-screen flex items-start lg:items-center px-6 sm:px-10 pt-20 pb-16 lg:pt-24"
    >

      <div className="relative w-full max-w-[1100px] mx-auto z-10 flex flex-col lg:grid lg:grid-cols-[1.4fr_1fr] gap-6 sm:gap-10 lg:gap-16 items-center">
        <div>
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-green-500/10 border border-green-500/40 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="font-mono text-[11px] text-green-600 dark:text-green-400">Available for Internships</span>
        </motion.div>

        {/* Hi, my name is */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-mono text-brand-primary text-sm md:text-base mb-5"
        >
          Hi, my name is
        </motion.p>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[clamp(40px,8vw,80px)] font-bold text-slate-900 dark:text-slate-100 leading-[1.05] tracking-tight"
        >
          Kavisha Liyanage.
        </motion.h1>

        {/* Typewriter tagline — reserve 2 lines worth of height on mobile to avoid layout shift
            as the typed string changes length. */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-[clamp(28px,6vw,56px)] font-bold text-slate-500 dark:text-slate-400 leading-[1.1] tracking-tight mt-3 min-h-[2.4em] sm:min-h-[1.2em]"
        >
          I build{' '}
          <span className="text-slate-700 dark:text-slate-200">
            {typed}
            <span className="inline-block w-[3px] h-[0.85em] align-middle ml-1 bg-brand-primary animate-pulse" />
          </span>
        </motion.h2>

        {/* Mobile-only robot — sits between the tagline and description.
            On lg+ the robot lives in the right grid column instead (see below). */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="lg:hidden relative w-full mt-6 mb-2"
        >
          <div className="relative mx-auto w-full max-w-[260px] aspect-square rounded-3xl overflow-hidden">
            {robotBackdrop}
            <div className="relative w-full h-full [mask-image:radial-gradient(circle_at_center,#000_60%,transparent_88%)] dark:[mask-image:none]">
              {robotCanvas}
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 max-w-xl text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
        >
          Second-year{' '}
          <a
            href="https://sliit.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:underline underline-offset-4"
          >
            SLIIT
          </a>{' '}
          undergraduate specializing in Artificial Intelligence. I build{' '}
          <span className="text-slate-900 dark:text-slate-100">full-stack web, mobile, and machine learning applications</span>{' '}
          using{' '}
          <span className="text-slate-900 dark:text-slate-100">React, Node.js, Java, and Python</span>. Seeking a Software Engineering or AI internship.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-3"
        >
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center justify-center gap-2 px-7 py-4 text-sm md:text-base font-mono font-medium text-white bg-brand-primary rounded hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px] hover:shadow-brand-primary/60 transition-all"
          >
            Check out my work
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center justify-center gap-2 px-7 py-4 text-sm md:text-base font-mono font-medium text-brand-primary border border-brand-primary rounded hover:bg-brand-primary/10 hover:-translate-y-1 transition-all"
          >
            <Mail size={16} />
            Get in touch
          </a>
        </motion.div>

        </div>

        {/* Spline 3D robot — desktop only. On lg+ it sits in the second grid column
            (right side). On mobile the robot renders inline between the tagline and
            description instead (see the lg:hidden block above). */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hidden lg:block relative w-full"
        >
          {/* Soft outer glow behind the robot */}
          <div className="absolute inset-0 rounded-full bg-brand-primary/15 blur-[100px] scale-90 pointer-events-none" />

          {/* The Spline canvas renders its own dark background. In light mode that reads as a black
              rectangle, so we soft-mask it. In dark mode the canvas blends with the page bg, no mask needed. */}
          <div className="relative w-full aspect-square max-w-[480px] mx-auto">
            {/* Decorative backdrop: radial glow + grid + dots */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
              {robotBackdrop}
            </div>
            <div className="relative w-full h-full [mask-image:radial-gradient(circle_at_center,#000_55%,transparent_85%)] dark:[mask-image:none]">
              {robotCanvas}
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
