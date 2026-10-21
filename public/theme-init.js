// Applies the saved/system theme before first paint to avoid a light/dark flash.
// Served as a file (not inline) so the CSP can forbid inline scripts entirely.
// ThemeContext.tsx reads the class this sets and saves the 'theme' key on toggle.
let theme;
try { theme = localStorage.getItem('theme'); } catch { /* storage blocked */ }
if (theme !== 'light' && theme !== 'dark') {
  theme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
document.documentElement.classList.add(theme);
