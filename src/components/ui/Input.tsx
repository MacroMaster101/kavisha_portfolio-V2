import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  label,
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full bg-transparent border-0 border-b border-slate-300 dark:border-slate-700 px-0 py-2
          text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600
          focus:outline-none focus:border-brand-primary transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
