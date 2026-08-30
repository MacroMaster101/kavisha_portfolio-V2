import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { CustomCursor } from './components/ui/CustomCursor';
import { Loader } from './components/ui/Loader';
import { Portfolio } from './pages/Portfolio';
import { Analytics } from '@vercel/analytics/react';

// The intro is branding for a first-time visitor; replaying it on every refresh just
// puts a 4.5s animation between the reader and the page. sessionStorage scopes it to
// "once per tab session", so a reload (or navigating back) goes straight to content
// while a genuinely new visit still gets the intro.
const INTRO_SEEN_KEY = 'kl-intro-seen';

function hasSeenIntro() {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
  } catch {
    // Private mode / storage disabled: fall back to always showing the intro.
    return false;
  }
}

function App() {
  const [loading, setLoading] = useState(() => !hasSeenIntro());
  const wasLoading = useRef(loading);

  useEffect(() => {
    if (wasLoading.current && !loading) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
    wasLoading.current = loading;
  }, [loading]);

  const finishLoading = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      // Storage unavailable — the intro simply plays again next load.
    }
    setLoading(false);
  }, []);

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        {loading && <Loader onFinish={finishLoading} />}
        <CustomCursor />
        <div inert={loading ? true : undefined} aria-hidden={loading || undefined}>
          <Portfolio interactiveReady={!loading} />
        </div>
        <Analytics />
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
