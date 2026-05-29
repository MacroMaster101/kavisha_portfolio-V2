import { Section } from '../ui/Section';
import { Award } from 'lucide-react';

export function Certifications() {
  return (
    <Section id="certifications" num="06." title="Certifications & Awards">
      <div className="relative p-8 md:p-10 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
        <Award size={32} className="text-brand-primary mb-4" />
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          On the roadmap — building first, certifying along the way.
        </h3>
        <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
          Focused on shipping real projects right now. AI/ML and cloud certifications will appear here as they&apos;re earned.
        </p>
        <p className="font-mono text-xs text-brand-primary">— In Progress</p>
      </div>
    </Section>
  );
}
