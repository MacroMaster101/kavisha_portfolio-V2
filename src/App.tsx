import { ThemeProvider } from './contexts/ThemeContext';
import { ColorThemeConfig } from './theme/ThemeColors';
import { CustomCursor } from './components/ui/CustomCursor';
import { Portfolio } from './pages/Portfolio';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <ThemeProvider>
      <ColorThemeConfig />
      <CustomCursor />
      <Portfolio />
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
