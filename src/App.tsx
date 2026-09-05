import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { CustomCursor } from './components/ui/CustomCursor';
import { Loader } from './components/ui/Loader';
import { Portfolio } from './pages/Portfolio';
import { Analytics } from '@vercel/analytics/react';

// Distinguish the genuine first visit of a tab session from later refreshes so the intro
// can run longer the first time and snappier afterwards. Computed once per page load at
// module scope (before React), so it's read correctly even under StrictMode's double
// mount in dev. The intro still PLAYS on every load — only its duration changes.
const IS_FIRST_LOAD = (() => {
  try {
    const seen = sessionStorage.getItem('kl-intro-seen') === '1';
    sessionStorage.setItem('kl-intro-seen', '1');
    return !seen;
  } catch {
    // Storage unavailable (private mode) — treat every load as a first load.
    return true;
  }
})();

function App() {
  // The intro plays on every page load / refresh. Reduced-motion visitors still get a
  // near-instant version instead of the full animation (see runTime in Loader).
  const [loading, setLoading] = useState(true);
  // The heavy portfolio (GitHub fetch, project images, Spline WebGL, page-wide motion)
  // stays UNMOUNTED while the intro plays, so the loader animation has the main thread
  // to itself and stays smooth on low-end devices. It mounts the instant the loader
  // begins its exit — underneath the still-visible, fading loader — so the reveal is a
  // clean crossfade with no flash, and the heavy first-mount work is hidden behind the
  // fade instead of competing with the intro for every frame.
  const [showContent, setShowContent] = useState(false);
  const wasLoading = useRef(loading);

  useEffect(() => {
    if (wasLoading.current && !loading) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
    wasLoading.current = loading;
  }, [loading]);

  const finishLoading = useCallback(() => setLoading(false), []);

  // Fired when the loader starts fading out: mount the portfolio behind it now so it's
  // warm and laid out by the time the loader is gone. interactiveReady stays false until
  // the loader fully unmounts, so Spline/WebGL and the page-wide background animations
  // don't spin up during the fade.
  const revealContent = useCallback(() => setShowContent(true), []);

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        {loading && <Loader onFinish={finishLoading} onExitStart={revealContent} firstLoad={IS_FIRST_LOAD} />}
        <CustomCursor />
        {showContent && (
          <div inert={loading ? true : undefined} aria-hidden={loading || undefined}>
            <Portfolio interactiveReady={!loading} />
          </div>
        )}
        <Analytics />
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
