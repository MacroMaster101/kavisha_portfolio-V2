import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';

interface TimelineItemProps {
  degree: string;
  institution: string;
  period: string;
  location: string;
  description: string;
  index: number;
  badges?: string[];
}

export function TimelineItem({
  degree,
  institution,
  period,
  location,
  description,
  index,
  badges,
}: TimelineItemProps) {
  return (
    <motion.article
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative pl-8 pb-10 border-l-2 border-slate-200 dark:border-slate-800 last:pb-0 group"
    >
      {/* Marker */}
      <div className="absolute left-[-7px] top-1 w-3 h-3 rounded-full bg-white dark:bg-[#0a0418] border-2 border-brand-primary group-hover:scale-125 group-hover:bg-brand-primary transition-all" />

      <div className="rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 p-6 md:p-7 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 transition-all">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug mb-1">
              {degree}
            </h3>
            <p className="text-sm font-medium text-brand-primary">{institution}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary whitespace-nowrap">
            <Calendar size={11} />
            {period}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-4">
          <MapPin size={11} />
          {location}
        </p>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">{description}</p>

        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
