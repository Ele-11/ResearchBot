/**
 * UI Card Component
 */
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: string;
}

export function Card({ children, className = '', padding = '20px' }: CardProps) {
  return (
    <div
      className={`card ${className}`}
      style={{
        padding,
        background: 'var(--bg)',
        border: '1px solid var(--line)',
        borderRadius: '12px',
      }}
    >
      {children}
    </div>
  );
}