import { ThemeProvider } from './contexts/ThemeContext';
import { ColorThemeConfig } from './theme/ThemeColors';
import { CustomCursor } from './components/ui/CustomCursor';
import { Portfolio } from './pages/Portfolio';

function App() {
  return (
    <ThemeProvider>
      <ColorThemeConfig />
      <CustomCursor />
      <Portfolio />
    </ThemeProvider>
  );
}

export default App;
