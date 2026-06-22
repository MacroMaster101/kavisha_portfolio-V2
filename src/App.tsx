import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ColorThemeConfig } from './theme/ThemeColors';
import { CustomCursor } from './components/ui/CustomCursor';
import { Loader } from './components/ui/Loader';
import { Portfolio } from './pages/Portfolio';
import { Analytics } from '@vercel/analytics/react';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <ThemeProvider>
      <ColorThemeConfig />
      {loading && <Loader onFinish={() => setLoading(false)} />}
      <CustomCursor />
      <Portfolio />
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
