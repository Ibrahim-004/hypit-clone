import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

const variants: Record<string, string> = {
  primary: 'bg-primary hover:bg-primaryHover text-white',
  secondary: 'bg-surface2 hover:bg-line text-text border border-line',
  danger: 'bg-danger text-ink',
  ghost: 'text-accent hover:bg-surface2',
};

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
