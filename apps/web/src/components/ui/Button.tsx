/**
 * UI Button Component
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.2s',
    opacity: props.disabled ? 0.5 : 1,
  };

  const variants = {
    primary: {
      background: 'var(--ink)',
      color: 'white',
    },
    secondary: {
      background: 'var(--surface)',
      color: 'var(--ink)',
      border: '1px solid var(--line)',
    },
  };

  return (
    <button
      className={`btn btn-${variant} ${className}`}
      style={{ ...baseStyle, ...variants[variant] }}
      {...props}
    >
      {children}
    </button>
  );
}