// Keeps the visitor's place across a refresh. The browser can't do it on its own here:
// the portfolio isn't rendered while the intro plays, so when the browser tries to restore
// the scroll position the page has no height and it lands at the top.
//
// Instead we save which section is at the top of the screen (and how far into it) when
// the page is left, and scroll back there once the content renders. Sections load images
// and GitHub data after that, so the position is re-applied while the layout settles,
// until the visitor scrolls themselves. A link to a #section (with nothing saved) is
// handled the same way.

const KEY = 'kl-scroll';
// Matches html's scroll-padding-top (index.css): the fixed navbar's height.
const NAV_OFFSET = 90;
// How long to keep correcting for late layout shifts.
const SETTLE_MS = 3000;

interface Saved {
  id?: string;
  offset: number;
  y: number;
}

const pageTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

function save() {
  const y = window.scrollY;
  let id: string | undefined;
  let offset = 0;
  for (const section of document.querySelectorAll<HTMLElement>('main section[id]')) {
    if (section.getBoundingClientRect().top <= NAV_OFFSET + 1) {
      id = section.id;
      offset = y - pageTop(section);
    }
  }
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ id, offset, y } satisfies Saved));
  } catch {
    /* storage unavailable */
  }
}

/** Call once at startup: takes scroll restoration over from the browser. */
export function initScrollRestore() {
  try {
    history.scrollRestoration = 'manual';
  } catch {
    /* not supported */
  }
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });
}

function read(): Saved | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    if (typeof value === 'object' && value !== null && typeof (value as Saved).y === 'number') return value as Saved;
  } catch {
    /* storage unavailable or corrupt */
  }
  return null;
}

/**
 * Scrolls back to the saved place (or the URL's #section) once the content is rendered,
 * and keeps it there while the layout settles. Returns a cleanup function.
 */
export function restoreScroll(): () => void {
  const saved = read();
  const hash = decodeURIComponent(location.hash.slice(1));
  if (!saved && !hash) return () => undefined;

  const target = (): number | null => {
    if (saved) {
      const section = saved.id ? document.getElementById(saved.id) : null;
      return section ? pageTop(section) + saved.offset : saved.y;
    }
    const el = hash ? document.getElementById(hash) : null;
    return el ? pageTop(el) - NAV_OFFSET : null;
  };

  const apply = () => {
    const top = target();
    if (top !== null && Math.abs(window.scrollY - top) > 2) window.scrollTo({ top, behavior: 'instant' });
  };

  apply();
  const main = document.getElementById('main-content');
  const observer = new ResizeObserver(apply);
  if (main) observer.observe(main);

  // The visitor taking over ends the restore.
  const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
  const stop = () => {
    observer.disconnect();
    window.clearTimeout(timer);
    events.forEach((e) => window.removeEventListener(e, stop));
  };
  events.forEach((e) => window.addEventListener(e, stop, { passive: true, once: true }));
  const timer = window.setTimeout(stop, SETTLE_MS);
  return stop;
}
