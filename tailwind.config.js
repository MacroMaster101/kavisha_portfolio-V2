/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          'primary-hover': 'var(--brand-primary-hover)',
          'primary-light': 'var(--brand-primary-light)',
          'primary-glow': 'var(--brand-primary-glow)',
          'primary-glow-hover': 'var(--brand-primary-glow-hover)',
          secondary: 'var(--brand-secondary)',
          'secondary-hover': 'var(--brand-secondary-hover)',
        }
      },
      fontFamily: {
        sans: ['Inter', '"SF Pro Display"', '"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        outfit: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
