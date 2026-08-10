import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
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
        <motion.div
          inert={loading ? true : undefined}
          aria-hidden={loading || undefined}
          initial={false}
          animate={{ opacity: loading ? 0.72 : 1, scale: loading ? 0.985 : 1, filter: loading ? 'blur(4px)' : 'blur(0px)' }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="origin-top will-change-[opacity,transform,filter]"
        >
          <Portfolio />
        </motion.div>
        <Analytics />
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
