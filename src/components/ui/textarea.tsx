import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'flex min-h-[100px] w-full rounded-xl border border-border/60 bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-primary/50 focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200 resize-y',
            error && 'border-error/60 focus:border-error focus:ring-error/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium text-error mt-1 flex items-center gap-1">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
