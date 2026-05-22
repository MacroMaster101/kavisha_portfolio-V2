import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const THEME_HINT_KEY = 'theme-hint-seen';

const navItems = [
  { num: '01.', name: 'About', href: '#about' },
  { num: '02.', name: 'Skills', href: '#skills' },
  { num: '03.', name: 'Projects', href: '#projects' },
  { num: '04.', name: 'Experience', href: '#experience' },
  { num: '05.', name: 'Education', href: '#education' },
  { num: '06.', name: 'Certifications', href: '#certifications' },
  { num: '07.', name: 'Writing', href: '#blogs' },
  { num: '08.', name: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showThemeHint, setShowThemeHint] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Show "Try [other] mode" tooltip once per visitor — fires only after 10s of idle
  // (no mouse / key / touch) AND only while the user is still in the hero/header area
  // (hasn't scrolled past one viewport). If they leave the hero, the hint is dropped.
  useEffect(() => {
    try {
      if (localStorage.getItem(THEME_HINT_KEY)) return;
    } catch { /* localStorage blocked — show the hint anyway */ }

    let idleTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let shown = false;
    let cancelled = false;

    const persistSeen = () => {
      try { localStorage.setItem(THEME_HINT_KEY, '1'); } catch { /* ignore */ }
    };

    const show = () => {
      if (shown || cancelled) return;
      // Final guard — don't surface the hint if the user has scrolled past the hero
      if (window.scrollY > window.innerHeight * 0.5) return;
      shown = true;
      setShowThemeHint(true);
      // Auto-dismiss 10s after it appears
      hideTimer = setTimeout(() => {
        setShowThemeHint(false);
        persistSeen();
      }, 10000);
    };

    const resetIdle = () => {
      if (shown || cancelled) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(show, 10000);
    };

    const onScroll = () => {
      // Scrolling past ~half the viewport = user has left the hero region.
      // Cancel the hint permanently for this session.
      if (window.scrollY > window.innerHeight * 0.5) {
        cancelled = true;
        clearTimeout(idleTimer);
        if (shown) {
          // Already showing — just dismiss it
          clearTimeout(hideTimer);
          setShowThemeHint(false);
        }
        persistSeen();
        return;
      }
      // Still in hero — count this as activity (reset idle countdown)
      resetIdle();
    };

    // Start the idle countdown
    resetIdle();

    const activityEvents: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'touchstart', 'click'];
    activityEvents.forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }));
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(hideTimer);
      activityEvents.forEach(ev => window.removeEventListener(ev, resetIdle));
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const dismissHint = () => {
    setShowThemeHint(false);
    try { localStorage.setItem(THEME_HINT_KEY, '1'); } catch { /* ignore */ }
  };

  const handleToggleTheme = () => {
    dismissHint();
    toggleTheme();
  };

  const hidden = false;

  const scrollTo = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
    <motion.header
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'h-[70px] bg-white/95 dark:bg-[#030014]/95 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(2,12,27,0.4)] border-b border-slate-200/60 dark:border-slate-800/60'
          : 'h-[90px] bg-white/80 dark:bg-[#030014]/80 backdrop-blur-sm'
      }`}
    >
      <nav className="h-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => scrollTo(e, '#hero')}
          className="group relative flex items-center"
          aria-label="Home"
        >
          <span className="relative w-11 h-11 flex items-center justify-center font-mono font-bold text-brand-primary text-lg border-2 border-brand-primary rounded transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
            K
            <span className="absolute inset-0 border-2 border-brand-primary rounded translate-x-1.5 translate-y-1.5 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" />
          </span>
        </a>

        {/* Desktop nav — shown from lg+ only (8 nav items + Resume + toggle don't fit on tablet) */}
        <div className="hidden lg:flex items-center gap-2">
          <ol className="flex items-center gap-1">
            {navItems.map((item, idx) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
              >
                <a
                  href={item.href}
                  onClick={(e) => scrollTo(e, item.href)}
                  className="group flex items-baseline gap-1.5 px-3 py-2 text-[13px] text-slate-700 dark:text-slate-300 hover:text-brand-primary transition-colors"
                >
                  <span className="font-mono text-brand-primary text-xs">{item.num}</span>
                  <span className="font-medium">{item.name}</span>
                </a>
              </motion.li>
            ))}
          </ol>

          <motion.a
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            href={`${import.meta.env.BASE_URL}Kavisha_Liyanage_CV.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 px-4 py-2 text-[13px] font-mono font-medium text-brand-primary border border-brand-primary rounded hover:bg-brand-primary/10 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-brand-primary/30 transition-all"
          >
            Resume
          </motion.a>

          <div className="relative ml-2">
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={handleToggleTheme}
              aria-label="Toggle theme"
              className="relative w-9 h-9 flex items-center justify-center rounded text-slate-600 dark:text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}

              {/* Pulse ring while the hint is showing — draws attention to the toggle */}
              <AnimatePresence>
                {showThemeHint && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 rounded border border-brand-primary/60 animate-ping"
                  />
                )}
              </AnimatePresence>
            </motion.button>

            {/* Tooltip — first-visit nudge */}
            <AnimatePresence>
              {showThemeHint && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 z-50"
                >
                  <div className="relative flex items-center gap-2 px-3 py-2 rounded-md bg-brand-primary text-white text-[12px] font-mono shadow-xl shadow-brand-primary/40 whitespace-nowrap">
                    <Sparkles size={13} />
                    Try {theme === 'dark' ? 'light' : 'dark'} mode
                    <button
                      onClick={dismissHint}
                      aria-label="Dismiss"
                      className="ml-1 -mr-1 w-4 h-4 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
                    >
                      <X size={11} />
                    </button>
                    {/* Caret pointing up to the toggle */}
                    <span className="absolute -top-1 right-3 w-2 h-2 bg-brand-primary rotate-45" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile + tablet controls (hidden on lg+ where desktop nav shows) */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="relative">
            <button
              onClick={handleToggleTheme}
              aria-label="Toggle theme"
              className="relative w-9 h-9 flex items-center justify-center rounded text-slate-600 dark:text-slate-400 hover:text-brand-primary"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <AnimatePresence>
                {showThemeHint && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 rounded border border-brand-primary/60 animate-ping"
                  />
                )}
              </AnimatePresence>
            </button>
            <AnimatePresence>
              {showThemeHint && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 z-50"
                >
                  <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-brand-primary text-white text-[11px] font-mono shadow-xl shadow-brand-primary/40 whitespace-nowrap">
                    <Sparkles size={11} />
                    Try {theme === 'dark' ? 'light' : 'dark'} mode
                    <span className="absolute -top-1 right-3 w-2 h-2 bg-brand-primary rotate-45" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </motion.header>
    </>
  );
}
