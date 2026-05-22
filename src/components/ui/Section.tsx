import { type ReactNode } from 'react';

interface SectionProps {
  id: string;
  num?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  bare?: boolean;
  full?: boolean;
}

export function Section({ id, num, title, children, className = '', bare = false, full = false }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative ${full ? 'min-h-screen flex items-center' : 'py-24 md:py-28'} ${className}`}
    >
      <div className={`w-full ${full ? 'max-w-[1000px]' : 'max-w-[1000px]'} mx-auto px-6 sm:px-10`}>
        {!bare && title && (
          <header className="flex items-center gap-3 md:gap-4 mb-12 md:mb-16">
            {num && (
              <h2 className="flex items-baseline gap-3 md:gap-4 whitespace-nowrap">
                <span className="font-mono text-brand-primary text-base md:text-xl font-normal">
                  {num}
                </span>
                <span className="text-2xl md:text-3xl lg:text-[32px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {title}
                </span>
              </h2>
            )}
            {!num && title && (
              <h2 className="text-2xl md:text-3xl lg:text-[32px] font-bold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap">
                {title}
              </h2>
            )}
            <span className="flex-1 h-px bg-slate-300 dark:bg-slate-700 ml-2" />
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
