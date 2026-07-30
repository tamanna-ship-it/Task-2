import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'bordered' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6',
    flat: 'bg-slate-50 rounded-2xl p-6',
    bordered: 'bg-white rounded-2xl border border-slate-200 p-6',
    glass: 'bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl p-6',
  }[variant];

  return (
    <div className={`${variantStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
