import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, User, Wrench, FolderGit2, Briefcase, GraduationCap,
  Award, BookOpen, Mail, FileText,
  LayoutGrid, X,
} from 'lucide-react';

// Sections that appear in the expandable Navigation Hub grid.
// `id` matches the section anchor; 'hero' is the top of the page.
const hubItems = [
  { id: 'hero',           name: 'Home',    Icon: Home },
  { id: 'about',          name: 'About',   Icon: User },
  { id: 'skills',         name: 'Skills',  Icon: Wrench },
  { id: 'projects',       name: 'Work',    Icon: FolderGit2 },
  { id: 'experience',     name: 'Exp',     Icon: Briefcase },
  { id: 'education',      name: 'Edu',     Icon: GraduationCap },
  { id: 'certifications', name: 'Certs',   Icon: Award },
  { id: 'blogs',          name: 'Writing', Icon: BookOpen },
  { id: 'contact',        name: 'Contact', Icon: Mail },
] as const;

// Sections used for active-state detection (real anchors only, skip 'hero').
const detectableIds = hubItems.filter((i) => i.id !== 'hero').map((i) => i.id);

// Quick icons in the collapsed bar (left and right of the center menu button).
// Icons clearly map to their destination, with a short label under each.
const quickLeft = [
  { id: 'hero',   name: 'Home',   Icon: Home },
  { id: 'skills', name: 'Skills', Icon: Wrench },
] as const;
const quickRight = [
  { id: 'projects', name: 'Work',    Icon: FolderGit2 },
  { id: 'contact',  name: 'Contact', Icon: Mail },
] as const;

export function BottomNav() {
  const [activeId, setActiveId] = useState<string>('about');
  const [visible, setVisible] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);

  // Track which section is in view by measuring scroll position against section bounds.
  // IntersectionObserver was unreliable for short sections (Skills, Projects, Experience),
  // so we do a manual check: the "active" section is whichever one's top is closest to
  // the top of the viewport (minus the navbar offset).
  useEffect(() => {
    const detect = () => {
      const sections = detectableIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));

      if (sections.length === 0) return;

      // Detection point: 30% down from the top of the viewport. Whichever section's
      // top has crossed above this line (and whose bottom hasn't crossed below it)
      // is the active one.
      const detectionLine = window.innerHeight * 0.3;

      let current = sections[0].id;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= detectionLine) {
          current = section.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };

    detect();
    window.addEventListener('scroll', detect, { passive: true });
    window.addEventListener('resize', detect);
    return () => {
      window.removeEventListener('scroll', detect);
      window.removeEventListener('resize', detect);
    };
  }, []);

  // Show the bottom nav only once the About section has entered the viewport.
  // Hides again if the user scrolls back to the hero.
  useEffect(() => {
    const checkVisibility = () => {
      const about = document.getElementById('about');
      if (!about) return;
      const aboutTop = about.getBoundingClientRect().top;
      // About has started entering the viewport (top is at or above the bottom edge).
      setVisible(aboutTop < window.innerHeight * 0.85);
    };

    checkVisibility();
    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('resize', checkVisibility);
    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    };
  }, []);

  // Lock body scroll while the hub overlay is open.
  useEffect(() => {
    if (!hubOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [hubOpen]);

  // Close the hub on Escape.
  useEffect(() => {
    if (!hubOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setHubOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hubOpen]);

  const scrollToId = (id: string) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    scrollToId(id);
  };

  const handleHubNav = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setHubOpen(false);
    scrollToId(id);
  };

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
              role="dialog"
              aria-modal="true"
              aria-label="Navigation hub"
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
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-brand-secondary/50 text-brand-secondary">KL</span>
              </div>
              <p className="font-mono text-[9px] text-slate-500 mt-0.5 mb-3.5">EXPLORE PORTFOLIO SECTIONS</p>

              <div className="grid grid-cols-3 gap-2.5">
                {hubItems.map(({ id, name, Icon }) => {
                  const active = activeId === id;
                  return (
                    <a
                      key={id}
                      href={id === 'hero' ? '#hero' : `#${id}`}
                      onClick={(e) => handleHubNav(e, id)}
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
                  href={`${import.meta.env.BASE_URL}Kavisha_Liyanage_CV.pdf`}
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

      {/* ===== Collapsed bottom bar ===== */}
      <nav
        aria-label="Section navigation"
        className={`fixed bottom-3 inset-x-3 z-50 transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-[140%] opacity-0 pointer-events-none'
        }`}
      >
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
            {quickLeft.map(({ id, name, Icon }) => {
              const active = activeId === id;
              return (
                <a
                  key={id}
                  href={id === 'hero' ? '#hero' : `#${id}`}
                  onClick={(e) => handleQuick(e, id)}
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
            })}

            {/* Center toggle button */}
            <button
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
            {quickRight.map(({ id, name, Icon }) => {
              const active = activeId === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => handleQuick(e, id)}
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
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
