import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full text-sm font-medium rounded-xl border bg-white px-3.5 py-2.5 transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              error
                ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
                : 'border-slate-200 text-slate-900 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
            } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-0.5">⚠️ {error}</span>}
        {!error && helperText && <span className="text-xs text-slate-500 mt-0.5">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
