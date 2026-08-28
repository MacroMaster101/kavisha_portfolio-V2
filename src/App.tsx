import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { CustomCursor } from './components/ui/CustomCursor';
import { Loader } from './components/ui/Loader';
import { Portfolio } from './pages/Portfolio';
import { Analytics } from '@vercel/analytics/react';

function App() {
  // A fresh document load always gets the intro. Fast Refresh preserves this
  // state during development, while a real browser refresh mounts it again.
  const [loading, setLoading] = useState(true);
  const wasLoading = useRef(loading);

  useEffect(() => {
    if (wasLoading.current && !loading) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
    wasLoading.current = loading;
  }, [loading]);

  const finishLoading = useCallback(() => {
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
