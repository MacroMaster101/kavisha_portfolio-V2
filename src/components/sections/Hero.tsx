import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Bot, Mail } from 'lucide-react';
import { RobotBackdrop } from '../ui/RobotBackdrop';

// Tracks a CSS media query. Used to mount the (expensive) Spline robot in exactly
// ONE place per breakpoint — never two WebGL contexts at once.
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

// Lazy-load Spline so it doesn't bloat the initial bundle.
const Spline = lazy(() => import('@splinetool/react-spline'));

// Public Spline scene — interactive robot that follows the cursor.
// To swap: go to spline.design → open a community scene → click "Export" → "Code Export" → copy the .splinecode URL.
const SPLINE_ROBOT = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

type RobotState = 'checking' | 'waiting' | 'ready' | 'failed';

// Spline uses WebGL2-only depth-buffer APIs. Some browsers expose a WebGL 1
// fallback and then crash when the runtime calls clearBufferfv(), so require a
// genuine WebGL2 context before the Spline bundle is allowed to mount.
function supportsSplineRenderer() {
  if (typeof document === 'undefined') return false;

  const canvas = document.createElement('canvas');

  try {
    const context = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      depth: true,
      stencil: true,
    });
    if (!context) return false;

    const version = String(context.getParameter(context.VERSION));
    return version.includes('WebGL 2') && typeof context.clearBufferfv === 'function';
  } catch {
    return false;
  }
}

function RobotFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-label="Decorative robot illustration">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-brand-primary/25 bg-white/35 shadow-[0_20px_70px_rgba(99,102,241,.2)] backdrop-blur-sm dark:bg-slate-950/30 sm:h-36 sm:w-36">
        <div className="absolute inset-3 rounded-[1.5rem] border border-brand-secondary/20" />
        <Bot className="relative h-14 w-14 text-brand-primary drop-shadow-[0_0_18px_rgba(99,102,241,.45)] sm:h-20 sm:w-20" strokeWidth={1.35} />
      </div>
    </div>
  );
}

class RobotErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function isSplineRendererFailure(value: unknown) {
  const text = value instanceof Error
    ? `${value.message} ${value.stack ?? ''}`
    : String(value ?? '');

  return /react-spline|renderSplineScene|clearBufferfv|WebGLRenderer|WebGL context|framebuffer is incomplete/i.test(text);
}

const roles = [
  'intelligent things for the web.',
  'AI-powered applications.',
  'full-stack mobile apps.',
  'secure REST APIs.',
  'machine learning models.',
];

function useTypewriter(words: string[], reducedMotion: boolean, typeMs = 70, holdMs = 1800, eraseMs = 35) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'erasing'>('typing');

  useEffect(() => {
    if (reducedMotion) return;
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
  }, [text, phase, wordIdx, words, reducedMotion, typeMs, holdMs, eraseMs]);

  return reducedMotion ? words[0] : text;
}

export function Hero({ interactiveReady }: { interactiveReady: boolean }) {
  const reduceMotion = useReducedMotion() === true;
  const typed = useTypewriter(roles, reduceMotion);
  const [robotState, setRobotState] = useState<RobotState>('checking');

  // Render the robot in exactly one spot per breakpoint (lg = 1024px) so only a
  // single Spline WebGL context is ever mounted. Two contexts caused heavy lag.
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Older published Spline scenes are migrated in memory by the current runtime.
  // The runtime reports that expected migration as a console warning even though
  // loading succeeds. Filter only that exact vendor notice during scene startup.
  useEffect(() => {
    const originalWarn = console.warn;
    const filteredWarn = (...args: unknown[]) => {
      if (args[0] === 'updating from ' && args[2] === 'to ') return;
      originalWarn(...args);
    };
    console.warn = filteredWarn;

    return () => {
      if (console.warn === filteredWarn) console.warn = originalWarn;
    };
  }, []);

  // Verify WebGL2 before importing Spline. The visual backdrop/fallback renders
  // immediately. Do not initialize the large runtime beneath the intro loader.
  useEffect(() => {
    if (!interactiveReady) return;

    let timer: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      if (!supportsSplineRenderer()) {
        setRobotState('failed');
        return;
      }

      if (reduceMotion) {
        setRobotState('ready');
        return;
      }

      setRobotState('waiting');
      timer = window.setTimeout(() => setRobotState('ready'), 450);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
    };
  }, [interactiveReady, reduceMotion]);

  // setGlobalEvents(true) makes the robot's "look at cursor" behavior track the
  // mouse across the WHOLE window (navbar, side rails, every corner), not just over
  // the canvas.
  const splineAppRef = useRef<{
    play?: () => void;
    stop?: () => void;
    setZoom?: (zoom: number) => void;
    setGlobalEvents?: (global: boolean) => void;
  } | null>(null);

  const handleSplineFailure = useCallback(() => {
    splineAppRef.current?.stop?.();
    splineAppRef.current = null;
    setRobotState('failed');
  }, []);

  // Spline performs much of its rendering asynchronously, outside React's error
  // boundary. If a driver fails after the capability check, unmount it immediately.
  useEffect(() => {
    if (robotState !== 'ready') return;

    const onError = (event: ErrorEvent) => {
      if (isSplineRendererFailure(event.error ?? event.message)) handleSplineFailure();
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isSplineRendererFailure(event.reason)) handleSplineFailure();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [handleSplineFailure, robotState]);

  const handleSplineLoad = useCallback(
    (app: { play?: () => void; stop?: () => void; setZoom?: (zoom: number) => void; setGlobalEvents?: (global: boolean) => void }) => {
      splineAppRef.current = app;
      // The scene's responsive camera crops the character on narrow canvases.
      // Pulling it back keeps the head, face, hands, and torso in the safe area.
      app.setZoom?.(isDesktop ? 0.92 : 0.48);
      app.setGlobalEvents?.(true);
    },
    [isDesktop]
  );

  // Pause the render loop only when the browser TAB is hidden (so we don't burn GPU
  // in the background), and resume in place when it's shown again. We deliberately do
  // NOT pause on scroll — calling play() after stop() makes Spline replay the robot's
  // intro animation, which looked jarring when scrolling back up to the hero.
  useEffect(() => {
    const onVisibility = () => {
      const app = splineAppRef.current;
      if (!app) return;
      if (document.hidden) app.stop?.();
      else app.play?.();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // The Spline robot canvas, reused in two spots: inline on mobile (between the
  // tagline and description) and in the right column on desktop.
  const fallbackRobot = <RobotFallback />;
  const robotCanvas = robotState === 'ready' ? (
    <RobotErrorBoundary fallback={fallbackRobot} onFailure={handleSplineFailure}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-primary/30 border-t-brand-primary" />
          </div>
        }
      >
        <Spline
          className="h-full w-full"
          scene={SPLINE_ROBOT}
          onLoad={handleSplineLoad}
        />
      </Suspense>
    </RobotErrorBoundary>
  ) : fallbackRobot;

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden flex items-start lg:items-center px-6 sm:px-10 pt-28 pb-16 lg:pt-24"
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

        {/* A fixed two-line slot prevents longer phrases from moving the robot and
            everything below it while the typewriter cycles. */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="h-[2.35em] overflow-hidden break-words text-[clamp(28px,6vw,56px)] font-bold text-slate-500 dark:text-slate-400 leading-[1.1] tracking-tight mt-3"
        >
          I build{' '}
          <span className="text-slate-700 dark:text-slate-200">
            {typed}
            <span className="inline-block w-[3px] h-[0.85em] align-middle ml-1 bg-brand-primary animate-pulse" />
          </span>
        </motion.h2>

        {/* Mobile-only robot — sits between the tagline and description. Rendered
            only on mobile so just one Spline WebGL context exists at a time. */}
        {!isDesktop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="relative w-full mt-4 mb-2 overflow-hidden"
          >
            <div className="relative mx-auto aspect-square w-full max-w-[clamp(220px,58vw,280px)] overflow-hidden">
              <RobotBackdrop />
              {/* In light mode the Spline canvas paints a dark square, so we soft-mask
                  its edges to blend into the page. In dark mode no mask is needed. */}
              <div className="relative h-full w-full [mask-image:radial-gradient(circle_at_center,#000_78%,transparent_98%)] dark:[mask-image:none]">
                {robotCanvas}
              </div>
            </div>
          </motion.div>
        )}

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 max-w-xl text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
        >
          Third-year{' '}
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
            className="group inline-flex items-center justify-center gap-2 px-7 py-4 text-sm md:text-base font-mono font-medium text-white bg-brand-primary rounded hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px] hover:shadow-brand-primary/60 transition-all"
          >
            Check out my work
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <a
            href="#contact"
            className="group inline-flex items-center justify-center gap-2 px-7 py-4 text-sm md:text-base font-mono font-medium text-brand-primary border border-brand-primary rounded hover:bg-brand-primary/10 hover:-translate-y-1 transition-all"
          >
            <Mail size={16} />
            Get in touch
          </a>
        </motion.div>

        </div>

        {/* Spline 3D robot — desktop only, in the right grid column. Rendered only
            on desktop so just one Spline WebGL context exists at a time. */}
        {isDesktop && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full"
        >
          {/* Soft outer glow bleeding beyond the panel */}
          <div className="absolute inset-0 rounded-full bg-brand-primary/15 blur-[100px] scale-90 pointer-events-none" />

          {/* Orbital backdrop panel with the robot composited on top */}
          <div className="relative w-full aspect-square max-w-[480px] mx-auto">
            <RobotBackdrop />
            {/* In light mode the Spline canvas paints a dark square, so we soft-mask
                its edges to blend into the page. In dark mode no mask is needed. */}
            <div className="relative h-full w-full [mask-image:radial-gradient(circle_at_center,#000_78%,transparent_98%)] dark:[mask-image:none]">
              {robotCanvas}
            </div>
          </div>

        </motion.div>
        )}
      </div>
    </section>
  );
}
