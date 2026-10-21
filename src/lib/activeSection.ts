import { useEffect, useState } from 'react';

// The section the visitor is reading: the last of `ids` (in page order) whose top has
// crossed a line 30% down the viewport, or `fallback` while none has. IntersectionObserver
// was unreliable for short sections (Skills, Projects, Experience), so this measures.
export function activeSection(ids: readonly string[], fallback: string): string {
  const line = window.innerHeight * 0.3;
  let current = fallback;
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top > line) break;
    current = id;
  }
  return current;
}

// activeSection(), kept current on scroll and resize. `ids` should be a module constant.
export function useActiveSection(ids: readonly string[], fallback: string): string {
  const [active, setActive] = useState(fallback);

  useEffect(() => {
    const detect = () => setActive(activeSection(ids, fallback));
    detect();
    window.addEventListener('scroll', detect, { passive: true });
    window.addEventListener('resize', detect);
    return () => {
      window.removeEventListener('scroll', detect);
      window.removeEventListener('resize', detect);
    };
  }, [ids, fallback]);

  return active;
}
