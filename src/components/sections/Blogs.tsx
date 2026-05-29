import { Section } from '../ui/Section';
import { BookOpen } from 'lucide-react';

export function Blogs() {
  return (
    <Section id="blogs" num="07." title="Things I've Written">
      <div className="relative p-8 md:p-10 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
        <BookOpen size={32} className="text-brand-primary mb-4" />
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Project breakdowns and engineering notes — soon.
        </h3>
        <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
          Planning to share learnings on AI, full-stack development, and software engineering — including
          write-ups on the projects I&apos;m shipping.
        </p>
        <p className="font-mono text-xs text-brand-primary">— Coming Soon</p>
      </div>
    </Section>
  );
}
