import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

// Card for a section that has no content yet (Writing, Certifications).
export function PlaceholderCard({
  Icon,
  heading,
  status,
  spoken,
  children,
}: {
  Icon: LucideIcon;
  heading: string;
  status: string;
  /** What the voice guide says for this card, so it lights up as it is named. */
  spoken?: string;
  children: ReactNode;
}) {
  return (
    <div data-narration-term={spoken} className="p-8 md:p-10 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
      <Icon size={32} className="text-brand-primary mb-4" />
      <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{heading}</h3>
      <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed mb-5">{children}</p>
      <p className="font-mono text-xs text-brand-primary">— {status}</p>
    </div>
  );
}
