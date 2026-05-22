import { useEffect, useRef, useState } from 'react';
import { User, Wrench, FolderGit2, Briefcase, GraduationCap, Award, BookOpen, Mail, FileText } from 'lucide-react';

const navItems = [
  { id: 'about', name: 'About', Icon: User },
  { id: 'skills', name: 'Skills', Icon: Wrench },
  { id: 'projects', name: 'Projects', Icon: FolderGit2 },
  { id: 'experience', name: 'Experience', Icon: Briefcase },
  { id: 'education', name: 'Education', Icon: GraduationCap },
  { id: 'certifications', name: 'Certs', Icon: Award },
  { id: 'blogs', name: 'Writing', Icon: BookOpen },
  { id: 'contact', name: 'Contact', Icon: Mail },
];

export function BottomNav() {
  const [activeId, setActiveId] = useState<string>('about');
  const [visible, setVisible] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

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

  // Auto-scroll the bottom nav horizontally so the active chip is centered.
  useEffect(() => {
    if (!activeId) return;
    const list = listRef.current;
    const item = itemRefs.current.get(activeId);
    if (!list || !item) return;

    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const targetScrollLeft =
      list.scrollLeft + (itemRect.left - listRect.left) - (listRect.width / 2) + (itemRect.width / 2);

    list.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
  }, [activeId]);

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
      <div className="relative mx-auto max-w-[640px] rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_-8px_rgba(2,12,27,0.4)] dark:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)]">
        {/* Horizontal scroll-snap rail for nav items + Resume */}
        <ul ref={listRef} className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto scrollbar-none">
          {navItems.map(({ id, name, Icon }) => {
            const active = activeId === id;
            return (
              <li
                key={id}
                ref={(el) => {
                  if (el) itemRefs.current.set(id, el);
                  else itemRefs.current.delete(id);
                }}
                className="shrink-0"
              >
                <a
                  href={`#${id}`}
                  onClick={(e) => handleClick(e, id)}
                  aria-current={active ? 'true' : undefined}
                  className={`group flex flex-col items-center gap-0.5 px-3 py-2 rounded-full transition-all ${
                    active
                      ? 'bg-brand-primary text-white shadow-[0_4px_12px_-2px] shadow-brand-primary/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10'
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-mono text-[9px] leading-none">{name}</span>
                </a>
              </li>
            );
          })}

          {/* Visual divider before Resume */}
          <li className="shrink-0 w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden />

          {/* Resume button */}
          <li className="snap-center shrink-0">
            <a
              href={`${import.meta.env.BASE_URL}Kavisha_Liyanage_CV.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-full text-brand-primary border border-brand-primary/50 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all"
            >
              <FileText size={16} />
              <span className="font-mono text-[9px] leading-none">Resume</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
