import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { CustomCursor } from './components/ui/CustomCursor';
import { Loader } from './components/ui/Loader';
import { Portfolio } from './pages/Portfolio';
import { Analytics } from '@vercel/analytics/react';

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
        {loading && <Loader onFinish={finishLoading} onExitStart={revealContent} />}
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
