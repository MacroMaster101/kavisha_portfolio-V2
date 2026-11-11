import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { sectionNum } from '../../data/sections';
import { NarrateButton } from './NarrateButton';

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;

// Each heading reveals as it scrolls into view: the number and title rise out of a mask,
// then the rule draws itself out to the listen button.
export function Section({ id, title, children }: SectionProps) {
  return (
    <section
      id={id}
      className="relative py-24 md:py-28"
    >
      <div className="w-full max-w-[1000px] mx-auto px-6 sm:px-10">
        <motion.header
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          className="flex items-center gap-3 md:gap-4 mb-12 md:mb-16"
        >
          <h2 className="flex items-baseline gap-2 md:gap-4 min-w-0 overflow-hidden pb-1">
            <motion.span
              variants={{ hidden: { y: '110%', opacity: 0 }, shown: { y: 0, opacity: 1 } }}
              transition={{ duration: 0.6, ease: EASE }}
              className="font-mono text-brand-primary text-base md:text-xl font-normal shrink-0"
            >
              {sectionNum(id)}
            </motion.span>
            <motion.span
              variants={{ hidden: { y: '110%', opacity: 0, filter: 'blur(6px)' }, shown: { y: 0, opacity: 1, filter: 'blur(0px)' } }}
              transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold text-slate-900 dark:text-slate-100 tracking-tight"
            >
              {title}
            </motion.span>
          </h2>
          <motion.span
            variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
            className="flex-1 h-px origin-left bg-gradient-to-r from-brand-primary/70 via-slate-300 to-slate-300 dark:via-slate-700 dark:to-slate-700 ml-2 shrink-0 min-w-[20px]"
          />
          <NarrateButton id={id} name={title} />
        </motion.header>
        {children}
      </div>
    </section>
  );
}
