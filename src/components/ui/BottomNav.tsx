import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, LayoutGrid, X } from 'lucide-react';
import { CV_URL } from '../../data/contact';
import { HOME, SECTIONS } from '../../data/sections';
import { useActiveSection } from '../../lib/activeSection';

// Destinations in the expandable Navigation Hub grid: the top of the page, then every
// section. Also the ids for active-state detection, so Home lights up above About.
const hubItems = [HOME, ...SECTIONS];
const hubIds = hubItems.map((item) => item.id);

// Quick icons in the collapsed bar (left and right of the center menu button).
const pick = (...ids: string[]) => hubItems.filter((item) => ids.includes(item.id));
const quickLeft = pick('hero', 'skills');
const quickRight = pick('projects', 'contact');

// Rendered for every quick item on both sides of the centre button. The two sides had
// byte-identical markup copy-pasted, so a styling tweak to one left the other stale.
type QuickItem = { id: string; shortName: string; Icon: (props: { size?: number }) => ReactNode };

function QuickLink({ id, shortName: name, Icon, active }: QuickItem & { active: boolean }) {
  return (
    <a
      href={`#${id}`}
      aria-label={name}
      className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
        active
          ? 'text-brand-primary bg-brand-primary/12'
          : 'text-slate-500 dark:text-slate-500 hover:text-brand-primary'
      }`}
    >
      <Icon size={18} />
      <span className="font-mono text-[9px] leading-none">{name}</span>
    </a>
  );
}

export function BottomNav() {
  const activeId = useActiveSection(hubIds, HOME.id);
  const [hubOpen, setHubOpen] = useState(false);
  const hubRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while the hub overlay is open.
  useEffect(() => {
    if (!hubOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [hubOpen]);

  // Keep keyboard focus inside the modal hub, close on Escape, and restore focus.
  useEffect(() => {
    if (!hubOpen) return;
    const toggleButton = toggleRef.current;
    const frame = requestAnimationFrame(() => hubRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHubOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !hubRef.current) return;
      const focusable = Array.from(
        hubRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKey);
      toggleButton?.focus();
    };
  }, [hubOpen]);


  return (
    <div className="lg:hidden">
      {/* ===== Expandable Navigation Hub ===== */}
      <AnimatePresence>
        {hubOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHubOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-[#04040e]/80 backdrop-blur-md"
              aria-hidden
            />

            {/* Hub panel */}
            <motion.div
              ref={hubRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation hub"
              tabIndex={-1}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed inset-x-3 bottom-[88px] z-50 rounded-3xl border border-slate-200/80 dark:border-brand-primary/30 bg-white/95 dark:bg-[#0c0c1c]/95 backdrop-blur-xl p-4 shadow-[0_0_50px_-8px] shadow-brand-primary/30 dark:shadow-brand-primary/40"
            >
              {/* Shimmer line */}
              <div className="absolute top-0 left-[20%] right-[20%] h-px rounded-full bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent pointer-events-none" />

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold tracking-wider text-slate-900 dark:text-slate-100">NAVIGATION HUB</h2>
                <button
                  type="button"
                  onClick={() => setHubOpen(false)}
                  aria-label="Close navigation hub"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-brand-primary/10 hover:text-brand-primary dark:text-slate-300"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="font-mono text-[9px] text-slate-500 mt-0.5 mb-3.5">EXPLORE PORTFOLIO SECTIONS</p>

              <div className="grid grid-cols-3 gap-2.5">
                {hubItems.map(({ id, shortName: name, Icon }) => {
                  const active = activeId === id;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={() => setHubOpen(false)}
                      aria-current={active ? 'location' : undefined}
                      className={`group aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                        active
                          ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white border border-transparent shadow-[0_0_16px] shadow-brand-primary/45'
                          : 'bg-brand-primary/[0.06] border border-brand-primary/15 text-slate-600 dark:text-slate-400 hover:bg-brand-primary/15 hover:text-brand-primary'
                      }`}
                    >
                      <Icon size={20} className="transition-transform group-hover:scale-110" />
                      <span className="font-mono text-[8.5px] tracking-wide uppercase leading-none">{name}</span>
                    </a>
                  );
                })}

                {/* CV — spans full width */}
                <a
                  href={CV_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-3 flex items-center justify-center gap-2 py-3 rounded-2xl border border-brand-primary/40 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all"
                >
                  <FileText size={16} />
                  <span className="font-mono text-[11px] tracking-wide uppercase">Download CV</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== Collapsed bottom bar =====
          Always shown below lg: it is the only navigation on phones and tablets (the top
          bar there holds just the logo and theme toggle). */}
      <nav aria-label="Section navigation" className="fixed bottom-3 inset-x-3 z-50">
        <div className="relative mx-auto max-w-[420px]">
          <div className="
            relative flex items-center justify-around
            px-2 h-[66px]
            rounded-3xl
            bg-white/80 dark:bg-white/[0.05]
            backdrop-blur-2xl
            border border-slate-200/80 dark:border-white/[0.08]
            shadow-[0_8px_32px_-8px_rgba(2,12,27,0.25)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
            overflow-visible
          ">
            {/* Subtle top hairline — kept faint so it doesn't cut a hard line across
                the bar near the center button. */}
            <div className="absolute top-0 left-[25%] right-[25%] h-px rounded-full bg-gradient-to-r from-transparent via-brand-primary/25 to-transparent pointer-events-none" />

            {/* Left quick items (icon + label) */}
            {quickLeft.map((item) => (
              <QuickLink key={item.id} {...item} active={activeId === item.id} />
            ))}

            {/* Center toggle button */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setHubOpen((o) => !o)}
              aria-label={hubOpen ? 'Close navigation hub' : 'Open navigation hub'}
              aria-expanded={hubOpen}
              className={`relative -mt-5 w-12 h-12 rounded-full flex items-center justify-center text-white border border-white/20 transition-all hover:scale-110 bg-brand-primary shadow-[0_0_22px] shadow-brand-primary/55 ${
                hubOpen ? 'shadow-[0_0_26px] shadow-brand-primary/70' : ''
              }`}
            >
              {/* Inner gloss */}
              <span className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/25 to-transparent pointer-events-none" />
              <motion.span
                key={hubOpen ? 'x' : 'grid'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center justify-center"
              >
                {hubOpen ? <X size={22} /> : <LayoutGrid size={20} />}
              </motion.span>
            </button>

            {/* Right quick items (icon + label) */}
            {quickRight.map((item) => (
              <QuickLink key={item.id} {...item} active={activeId === item.id} />
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
