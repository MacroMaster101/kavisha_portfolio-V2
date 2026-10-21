import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { EMAIL } from '../../data/contact';
import { SocialLinks } from './SocialLinks';

export function SideRails() {
  return (
    <>
      {/* Left rail — social icons */}
      <motion.aside
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="hidden lg:flex fixed left-10 xl:left-12 bottom-0 z-30 flex-col items-center gap-6 after:content-[''] after:block after:w-px after:h-24 after:bg-slate-400 dark:after:bg-slate-500"
      >
        <SocialLinks
          className="flex flex-col items-center gap-5 text-slate-500 dark:text-slate-400"
          linkClassName="inline-block p-1 hover:text-brand-primary hover:-translate-y-1 transition-all duration-200"
        />
      </motion.aside>

      {/* Right rail — vertical email */}
      <motion.aside
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="hidden lg:flex fixed right-10 xl:right-12 bottom-0 z-30 flex-col items-center gap-6 after:content-[''] after:block after:w-px after:h-24 after:bg-slate-400 dark:after:bg-slate-500"
      >
        <a
          href={`mailto:${EMAIL}`}
          className="font-mono text-xs tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-brand-primary hover:-translate-y-1 transition-all duration-200 [writing-mode:vertical-rl] flex items-center gap-2"
        >
          <Mail size={14} />
          {EMAIL}
        </a>
      </motion.aside>
    </>
  );
}
