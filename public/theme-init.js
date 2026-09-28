// Applies the saved/system theme before first paint to avoid a light/dark flash.
// Served as a file (not inline) so the CSP can forbid inline scripts entirely.
try {
  const saved = localStorage.getItem('theme');
  document.documentElement.classList.add(
    saved === 'light' || saved === 'dark'
      ? saved
      : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  );
} catch {
  document.documentElement.classList.add(
    matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  );
}
