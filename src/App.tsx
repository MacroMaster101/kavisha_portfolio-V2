import { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { CustomCursor } from './components/ui/CustomCursor';
import { Loader } from './components/ui/Loader';
import { Portfolio } from './pages/Portfolio';
import { Analytics } from '@vercel/analytics/react';

function App() {
  const [loading, setLoading] = useState(() => {
    try {
      return sessionStorage.getItem('intro-seen') !== '1' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });
  const wasLoading = useRef(loading);

  useEffect(() => {
    if (wasLoading.current && !loading) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
    wasLoading.current = loading;
  }, [loading]);

  const finishLoading = () => {
    try { sessionStorage.setItem('intro-seen', '1'); } catch { /* storage unavailable */ }
    setLoading(false);
  };

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        {loading && <Loader onFinish={finishLoading} />}
        <CustomCursor />
        <div inert={loading ? true : undefined} aria-hidden={loading || undefined}>
          <Portfolio />
        </div>
        <Analytics />
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
