import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { num: '01.', name: 'About', href: '#about' },
  { num: '02.', name: 'Skills', href: '#skills' },
  { num: '03.', name: 'Projects', href: '#projects' },
  { num: '04.', name: 'Experience', href: '#experience' },
  { num: '05.', name: 'Education', href: '#education' },
  { num: '06.', name: 'Certifications', href: '#certifications' },
  { num: '07.', name: 'Writing', href: '#blogs' },
  { num: '08.', name: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hidden = false;

  const scrollTo = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <motion.header
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'h-[70px] bg-white/85 dark:bg-[#030014]/85 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(2,12,27,0.7)]'
          : 'h-[90px] bg-transparent'
      }`}
    >
      <nav className="h-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => scrollTo(e, '#hero')}
          className="group relative flex items-center"
          aria-label="Home"
        >
          <span className="relative w-11 h-11 flex items-center justify-center font-mono font-bold text-brand-primary text-lg border-2 border-brand-primary rounded transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
            K
            <span className="absolute inset-0 border-2 border-brand-primary rounded translate-x-1.5 translate-y-1.5 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" />
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <ol className="flex items-center gap-1">
            {navItems.map((item, idx) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
              >
                <a
                  href={item.href}
                  onClick={(e) => scrollTo(e, item.href)}
                  className="group flex items-baseline gap-1.5 px-3 py-2 text-[13px] text-slate-700 dark:text-slate-300 hover:text-brand-primary transition-colors"
                >
                  <span className="font-mono text-brand-primary text-xs">{item.num}</span>
                  <span className="font-medium">{item.name}</span>
                </a>
              </motion.li>
            ))}
          </ol>

          <motion.a
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            href={`${import.meta.env.BASE_URL}Kavisha_Liyanage_CV.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 px-4 py-2 text-[13px] font-mono font-medium text-brand-primary border border-brand-primary rounded hover:bg-brand-primary/10 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-brand-primary/30 transition-all"
          >
            Resume
          </motion.a>

          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="ml-2 w-9 h-9 flex items-center justify-center rounded text-slate-600 dark:text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 flex items-center justify-center rounded text-slate-600 dark:text-slate-400 hover:text-brand-primary"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
            className="w-10 h-10 flex items-center justify-center text-brand-primary"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.645, 0.045, 0.355, 1] }}
            className="md:hidden fixed top-0 right-0 bottom-0 w-[75%] max-w-sm bg-slate-50 dark:bg-[#0a0418] shadow-2xl flex items-center justify-center"
          >
            <ol className="flex flex-col items-center gap-6">
              {navItems.map(item => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={(e) => scrollTo(e, item.href)}
                    className="flex flex-col items-center gap-1 text-slate-900 dark:text-white hover:text-brand-primary transition-colors"
                  >
                    <span className="font-mono text-sm text-brand-primary">{item.num}</span>
                    <span className="text-xl font-semibold">{item.name}</span>
                  </a>
                </li>
              ))}
              <a
                href={`${import.meta.env.BASE_URL}Kavisha_Liyanage_CV.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 px-6 py-3 text-base font-mono font-medium text-brand-primary border border-brand-primary rounded hover:bg-brand-primary/10 transition-colors"
              >
                Resume
              </a>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
