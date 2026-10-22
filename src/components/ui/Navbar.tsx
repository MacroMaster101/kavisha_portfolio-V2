import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/useTheme';
import { CV_URL } from '../../data/contact';
import { SECTIONS } from '../../data/sections';
import { useActiveSection } from '../../lib/activeSection';
import { HINT_DELAY, useHint } from '../../lib/hints';

// The theme toggle appears twice — once in the desktop bar, once in the mobile bar —
// and both carry the same first-visit nudge. These two pieces were copy-pasted between
// them, so a tweak to one silently left the other behind. `compact` covers the only
// real difference: the mobile bar renders a smaller tooltip.
function ThemeHintPulse({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 rounded border border-brand-primary/60 animate-ping"
        />
      )}
    </AnimatePresence>
  );
}

function ThemeHintTooltip({
  show,
  nextTheme,
  compact = false,
  onDismiss,
}: {
  show: boolean;
  nextTheme: string;
  compact?: boolean;
  onDismiss?: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`absolute right-0 top-full z-50 ${compact ? 'mt-2' : 'mt-3'}`}
        >
          <div
            className={`relative flex items-center rounded-md bg-brand-primary font-mono text-white shadow-xl shadow-brand-primary/40 whitespace-nowrap ${
              compact ? 'gap-1.5 px-2.5 py-1.5 text-[11px]' : 'gap-2 px-3 py-2 text-[12px]'
            }`}
          >
            <Sparkles size={compact ? 11 : 13} />
            Try {nextTheme} mode
            {onDismiss && (
              <button
                onClick={onDismiss}
                aria-label="Dismiss"
                className="ml-1 -mr-1 w-4 h-4 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
              >
                <X size={11} />
              </button>
            )}
            {/* Caret pointing up to the toggle */}
            <span className="absolute -top-1 right-3 w-2 h-2 bg-brand-primary rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const sectionIds = SECTIONS.map((section) => section.id);

export function Navbar({ interactiveReady }: { interactiveReady: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  // Scrollspy for the desktop links. While the hero still fills the screen (no section
  // crossed yet), nothing is highlighted.
  const activeId = useActiveSection(sectionIds, '');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // "Try [other] mode" nudge for visitors who haven't switched theme yet (lib/hints).
  const [showThemeHint, dismissHint] = useHint('theme', HINT_DELAY.theme, interactiveReady);

  const handleToggleTheme = () => {
    dismissHint();
    toggleTheme();
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'h-[70px] bg-page/90 dark:bg-page-dark/95 backdrop-blur-xl shadow-[0_8px_24px_-12px_rgba(2,12,27,0.25)] border-b border-slate-200/80 dark:border-slate-800/60'
          : 'h-[90px] bg-page/70 dark:bg-page-dark/80 backdrop-blur-md border-b border-slate-200/40 dark:border-transparent'
      }`}
    >
      <nav className="h-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-6 xl:px-12 flex items-center justify-between gap-4">
        {/* Logo */}
        <a
          href="#hero"
          className="group relative flex items-center"
          aria-label="Home"
        >
          <span className="relative w-11 h-11 flex items-center justify-center font-mono font-bold text-brand-primary text-lg border-2 border-brand-primary rounded transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
            K
            <span className="absolute inset-0 border-2 border-brand-primary rounded translate-x-1.5 translate-y-1.5 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" />
          </span>
        </a>

        {/* Desktop nav — shown from lg+ only (8 nav items + Resume + toggle don't fit on tablet).
            lg–xl (1024–1279px) is a compact version: no section numbers, tighter spacing.
            The full version needs ~1190px. */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          <ol className="flex items-center xl:gap-1">
            {SECTIONS.map((item, idx) => {
              const active = activeId === item.id;
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                >
                  <a
                    href={`#${item.id}`}
                    aria-current={active ? 'location' : undefined}
                    className={`group relative flex items-baseline gap-1.5 px-2 xl:px-3 py-2 text-[13px] transition-colors ${
                      active
                        ? 'text-brand-primary'
                        : 'text-slate-700 dark:text-slate-300 hover:text-brand-primary'
                    }`}
                  >
                    <span className="hidden xl:inline font-mono text-brand-primary text-xs">{item.num}</span>
                    <span className="font-medium">{item.navName}</span>
                    {/* Sliding underline that animates between active links */}
                    {active && (
                      <motion.span
                        layoutId="nav-active-underline"
                        className="absolute left-2 right-2 -bottom-0.5 h-0.5 rounded-full bg-brand-primary"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                </motion.li>
              );
            })}
          </ol>

          <motion.a
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            href={CV_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 xl:ml-4 px-3 xl:px-4 py-2 text-[13px] font-mono font-medium text-brand-primary border border-brand-primary rounded hover:bg-brand-primary/10 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-brand-primary/30 transition-all"
          >
            Resume
          </motion.a>

          <div className="relative ml-1 xl:ml-2">
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
              <ThemeHintPulse show={showThemeHint} />
            </motion.button>

            {/* Tooltip — first-visit nudge */}
            <ThemeHintTooltip
              show={showThemeHint}
              nextTheme={theme === 'dark' ? 'light' : 'dark'}
              onDismiss={dismissHint}
            />
          </div>
        </div>

        {/* Mobile + tablet controls (hidden on lg+ where desktop nav shows) */}
        <div className="relative lg:hidden">
            <button
              onClick={handleToggleTheme}
              aria-label="Toggle theme"
              className="relative w-9 h-9 flex items-center justify-center rounded text-slate-600 dark:text-slate-400 hover:text-brand-primary"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <ThemeHintPulse show={showThemeHint} />
            </button>
            <ThemeHintTooltip
              show={showThemeHint}
              nextTheme={theme === 'dark' ? 'light' : 'dark'}
              compact
              onDismiss={dismissHint}
            />
        </div>
      </nav>
    </header>
  );
}
