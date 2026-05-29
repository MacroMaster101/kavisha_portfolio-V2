import { useEffect, useState } from 'react';
import { User, FolderGit2, Mail, FileText } from 'lucide-react';

const navItems = [
  { id: 'about',   name: 'About',   Icon: User },
  { id: 'projects', name: 'Work',   Icon: FolderGit2 },
  // center K button goes here in JSX
  { id: 'contact', name: 'Contact', Icon: Mail },
] as const;

export function BottomNav() {
  const [activeId, setActiveId] = useState<string>('about');
  const [visible, setVisible] = useState(false);

  // Track which section is in view by measuring scroll position against section bounds.
  // IntersectionObserver was unreliable for short sections (Skills, Projects, Experience),
  // so we do a manual check: the "active" section is whichever one's top is closest to
  // the top of the viewport (minus the navbar offset).
  useEffect(() => {
    const detect = () => {
      const sections = navItems
        .map(({ id }) => document.getElementById(id))
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

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Section navigation"
      className={`lg:hidden fixed bottom-3 inset-x-3 z-40 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-[140%] opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative mx-auto max-w-[420px]">
        {/* Glass container */}
        <div className="
          relative flex items-center justify-around
          px-3 h-[58px]
          rounded-3xl
          bg-slate-900/60 dark:bg-white/[0.04]
          backdrop-blur-2xl
          border border-slate-800/50 dark:border-white/[0.08]
          shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]
          overflow-visible
        ">
          {/* Shimmer line at top of glass */}
          <div className="absolute top-0 left-[15%] right-[15%] h-px rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* About + Work (first 2 items) */}
          {navItems.slice(0, 2).map(({ id, name, Icon }) => {
            const active = activeId === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => handleClick(e, id)}
                aria-current={active ? 'location' : undefined}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
                  active
                    ? 'text-brand-primary'
                    : 'text-slate-400 dark:text-slate-500 hover:text-brand-primary'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                  active
                    ? 'bg-brand-primary/20 border border-brand-primary/40 shadow-[0_0_12px] shadow-brand-primary/30'
                    : 'bg-transparent'
                }`}>
                  <Icon size={15} />
                </div>
                <span className="font-mono text-[9px] leading-none">{name}</span>
              </a>
            );
          })}

          {/* Center K floater */}
          <div className="flex flex-col items-center gap-1 relative" style={{ marginTop: '-20px' }}>
            <a
              href="#hero"
              onClick={(e) => handleClick(e, 'hero')}
              aria-label="Home"
              className="
                w-10 h-10 rounded-full
                bg-gradient-to-br from-brand-primary to-brand-secondary
                flex items-center justify-center
                font-mono font-bold text-white text-sm
                shadow-[0_0_20px] shadow-brand-primary/60
                border border-white/15
                hover:scale-110 transition-transform
                relative
              "
            >
              {/* Inner gloss */}
              <span className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              K
            </a>
            <span className="font-mono text-[9px] leading-none text-slate-400 dark:text-slate-500">Home</span>
          </div>

          {/* Contact (3rd item) */}
          {navItems.slice(2).map(({ id, name, Icon }) => {
            const active = activeId === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => handleClick(e, id)}
                aria-current={active ? 'location' : undefined}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
                  active
                    ? 'text-brand-primary'
                    : 'text-slate-400 dark:text-slate-500 hover:text-brand-primary'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                  active
                    ? 'bg-brand-primary/20 border border-brand-primary/40 shadow-[0_0_12px] shadow-brand-primary/30'
                    : 'bg-transparent'
                }`}>
                  <Icon size={15} />
                </div>
                <span className="font-mono text-[9px] leading-none">{name}</span>
              </a>
            );
          })}

          {/* CV pill */}
          <a
            href={`${import.meta.env.BASE_URL}Kavisha_Liyanage_CV.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex flex-col items-center gap-1 px-2.5 py-1.5
              rounded-xl
              border border-brand-primary/45
              bg-brand-primary/8
              text-brand-primary
              hover:bg-brand-primary/15 transition-all
            "
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <FileText size={15} />
            </div>
            <span className="font-mono text-[9px] leading-none">CV</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
