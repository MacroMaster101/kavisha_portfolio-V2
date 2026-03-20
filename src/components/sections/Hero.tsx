import { motion } from 'framer-motion';
import { ArrowUpRight, Mail, Github, Linkedin } from 'lucide-react';
import { useEffect, useState } from 'react';

const fullName = 'Kavisha Lakshan';

export function Hero() {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      const isComplete = !isDeleting && text === fullName;
      const isDoneDeleting = isDeleting && text === '';

      if (isComplete) {
        setTimeout(() => setIsDeleting(true), 2000);
        return;
      }
      if (isDoneDeleting) {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(150);
        return;
      }

      const nextText = isDeleting
        ? fullName.substring(0, text.length - 1)
        : fullName.substring(0, text.length + 1);

      setText(nextText);
      setTypingSpeed(isDeleting ? 75 : 150);
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <section
      id="hero"
      className="relative min-h-[95vh] flex items-center justify-center pt-32 pb-20 overflow-hidden transition-colors duration-300"
    >
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 60, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-50 dark:bg-purple-900/10 rounded-full blur-[100px] opacity-60"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-brand-primary/10 rounded-full blur-[100px] opacity-40"
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[5%] left-[20%] w-[30%] h-[30%] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[80px] opacity-50"
        />
      </div>

      {/* Rotating Background Strokes */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-900 dark:border-white rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-900 dark:border-white rounded-full"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

          {/* Left Side – Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex-1 space-y-8 max-w-2xl"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/30 rounded-full text-brand-primary text-sm font-semibold tracking-wide"
              >
                <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                Available for Internships
              </motion.div>
              <div className="grid grid-cols-1 items-start">
                {/* Invisible spacer to prevent layout shift */}
                <h1 className="invisible pointer-events-none select-none text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] col-start-1 row-start-1">
                  I'm {fullName}
                  <span className="inline-block w-[4px] h-[0.8em] ml-1 align-middle" />
                </h1>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white leading-[1.1] col-start-1 row-start-1 tracking-tight">
                  I'm{' '}
                  <span className="text-brand-primary">{text.substring(0, 7)}</span>
                  <span className="text-slate-900 dark:text-white">{text.substring(7)}</span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-[4px] h-[0.8em] bg-brand-primary ml-1 align-middle"
                  />
                </h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed"
              >
                Software Engineering undergraduate at SLIIT specializing in Artificial Intelligence.
                Passionate about building scalable web applications and intelligent systems.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                About
              </button>
              <a
                href={`${import.meta.env.BASE_URL}Kavisha_Liyanage_CV.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 bg-brand-primary text-white rounded-2xl font-semibold hover:bg-brand-primary-hover transition-all shadow-lg hover:shadow-xl active:scale-95 inline-block text-center"
              >
                Download CV
              </a>
            </motion.div>
          </motion.div>

          {/* Right Side – Image Container */}
          <div className="relative flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Brand-colored rounded image box */}
              <div className="w-[300px] h-[400px] md:w-[450px] md:h-[550px] bg-brand-primary rounded-[60px] overflow-hidden relative shadow-2xl">
                <img
                  src={`${import.meta.env.BASE_URL}image.jpg`}
                  alt="Kavisha Liyanage"
                  className="w-full h-full object-cover transition-all duration-700"
                />
              </div>

              {/* Decorative strokes */}
              <div className="absolute -top-10 -right-10 w-20 h-20 opacity-20 pointer-events-none">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-900 dark:text-white">
                  <path d="M10 50 Q 30 10 50 50 T 90 50" />
                  <path d="M10 70 Q 30 30 50 70 T 90 70" />
                </svg>
              </div>

              {/* Arrow Button Overlay */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 45 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="absolute -bottom-8 -right-8 w-20 h-20 md:w-28 md:h-28 bg-white dark:bg-[#030014] rounded-full flex items-center justify-center shadow-2xl border-[12px] border-white dark:border-[#030014] group"
              >
                <div className="w-full h-full bg-brand-primary rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-95">
                  <ArrowUpRight size={40} className="md:w-12 md:h-12" />
                </div>
              </motion.button>

              {/* Social Links Side Strip */}
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 items-center">
                <span className="text-xs font-semibold text-brand-primary rotate-90 whitespace-nowrap mb-8 tracking-widest uppercase">
                  GET IN TOUCH
                </span>
                <div className="w-px h-12 bg-slate-200" />
                <a href="mailto:lakshan.kavishatt@gmail.com" title="Email Me" className="p-2 text-slate-400 hover:text-brand-primary transition-all duration-300 hover:scale-125">
                  <Mail size={20} />
                </a>
                <a href="https://github.com/MacroMaster101" target="_blank" rel="noopener noreferrer" title="GitHub" className="p-2 text-slate-400 hover:text-brand-primary transition-all duration-300 hover:scale-125">
                  <Github size={20} />
                </a>
                <a href="https://www.linkedin.com/in/kavisha-liyanage04/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="p-2 text-slate-400 hover:text-brand-primary transition-all duration-300 hover:scale-125">
                  <Linkedin size={20} />
                </a>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
