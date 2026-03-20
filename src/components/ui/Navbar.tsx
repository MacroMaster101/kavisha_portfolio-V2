import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { name: 'Home', href: '#hero' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Experience', href: '#experience' },
  { name: 'Education', href: '#education' },
  { name: 'Certifications', href: '#certifications' },
  { name: 'Blogs', href: '#blogs' },
  { name: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [activeTab, setActiveTab] = useState('Home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showThemeTooltip, setShowThemeTooltip] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setShowThemeTooltip(true), 1500);
    const hideTimer = setTimeout(() => setShowThemeTooltip(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    setShowThemeTooltip(false);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string, name: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveTab(name);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-8 left-0 w-full z-50 px-4">
      <div className="bg-brand-primary rounded-full px-6 py-2 flex items-center gap-4 shadow-lg backdrop-blur-sm border border-white/20 w-fit mx-auto">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="p-2 text-white hover:text-white/80"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Nav Links – Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => scrollToSection(e, item.href, item.name)}
              className={`text-[13px] xl:text-sm font-semibold transition-all duration-300 px-4 py-2 rounded-full whitespace-nowrap ${
                activeTab === item.name
                  ? 'bg-white text-brand-primary'
                  : 'text-white hover:text-white/80'
              }`}
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Theme Toggle */}
        <div className="relative">
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <AnimatePresence>
            {showThemeTooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute top-12 right-0 bg-white text-brand-primary text-[12px] font-bold py-2 px-3 rounded-xl shadow-[0_0_20px_var(--brand-primary-glow)] whitespace-nowrap border border-white/20 z-50 pointer-events-none"
              >
                <div className="flex items-center gap-1.5">
                  Try {theme === 'dark' ? 'Light' : 'Dark'} Mode!
                </div>
                <div className="absolute -top-1 right-3.5 w-2 h-2 bg-white rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-4 bg-brand-primary rounded-3xl p-6 shadow-2xl border border-white/20 overflow-y-auto max-h-[80vh] max-w-sm mx-auto"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href, item.name)}
                  className={`text-center text-lg font-semibold py-2 ${
                    activeTab === item.name
                      ? 'bg-white text-brand-primary rounded-full'
                      : 'text-white'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
