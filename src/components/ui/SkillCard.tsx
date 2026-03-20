import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { techIconsData } from '../../data/techIcons';

interface SkillCardProps {
  title: string;
  skills: string[];
  icon: LucideIcon;
  delay?: number;
}

export function SkillCard({ title, skills, icon: Icon, delay = 0 }: SkillCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="p-8 rounded-[32px] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-300 group"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary border border-slate-200 dark:border-slate-800 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
          <Icon size={28} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-brand-primary transition-colors">{title}</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => {
          const iconData = techIconsData[skill];
          return (
            <span
              key={index}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-primary/30 hover:text-brand-primary transition-all duration-300"
            >
              {iconData && (
                <svg viewBox="0 0 24 24" fill={iconData.color} className="w-4 h-4">
                  <path d={iconData.path} />
                </svg>
              )}
              {skill}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
