import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className = '',
  label,
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-widest mb-2 ml-1 uppercase">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[24px]
          text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium min-h-[150px]
          focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-2 text-sm font-semibold text-red-500 ml-2">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
