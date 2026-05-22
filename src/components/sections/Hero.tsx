import { Suspense, lazy, useEffect, useState } from 'react';
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
        setWordIdx((wordIdx + 1) % words.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(t);
  }, [text, phase, wordIdx, words, typeMs, holdMs, eraseMs]);

  return text;
}

export function Hero() {
  const typed = useTypewriter(roles);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-start lg:items-center px-6 sm:px-10 pt-28 pb-16 lg:pt-24"
    >

      <div className="relative w-full max-w-[1100px] mx-auto z-10 grid lg:grid-cols-[1.4fr_1fr] gap-6 sm:gap-10 lg:gap-16 items-center">
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

        {/* Spline 3D robot — interactive, follows cursor.
            On lg+ it sits in the second grid column (right side).
            On mobile/tablet it appears below the text (smaller). */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full"
        >
          {/* Soft glow behind the robot */}
          <div className="absolute inset-0 rounded-full bg-brand-primary/15 blur-[100px] scale-90 pointer-events-none" />

          {/* The Spline canvas renders its own dark background. In light mode that reads as a black
              rectangle, so we soft-mask it. In dark mode the canvas blends with the page bg, no mask needed. */}
          <div className="relative w-full aspect-square max-w-[220px] sm:max-w-[300px] lg:max-w-[480px] mx-auto [mask-image:radial-gradient(circle_at_center,#000_55%,transparent_85%)] dark:[mask-image:none]">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-brand-primary/30 border-t-brand-primary animate-spin" />
                </div>
              }
            >
              <Spline scene={SPLINE_ROBOT} />
            </Suspense>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
