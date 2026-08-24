import { type ReactNode } from 'react';

interface SectionProps {
  id: string;
  num: string;
  title: string;
  children: ReactNode;
}

export function Section({ id, num, title, children }: SectionProps) {
  return (
    <section
      id={id}
      className="relative py-24 md:py-28"
    >
      <div className="w-full max-w-[1000px] mx-auto px-6 sm:px-10">
        <header className="flex items-center gap-3 md:gap-4 mb-12 md:mb-16">
          <h2 className="flex items-baseline gap-2 md:gap-4 min-w-0">
            <span className="font-mono text-brand-primary text-base md:text-xl font-normal shrink-0">
              {num}
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </span>
          </h2>
          <span className="flex-1 h-px bg-slate-300 dark:bg-slate-700 ml-2 shrink-0 min-w-[20px]" />
        </header>
        {children}
      </div>
    </section>
  );
}
