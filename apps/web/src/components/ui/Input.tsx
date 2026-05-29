/**
 * UI Input Component
 */
import type { TextareaHTMLAttributes } from 'react';

interface InputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <textarea
      className={`input-field ${error ? 'input-error' : ''} ${className}`}
      style={{
        width: '100%',
        padding: '12px 14px',
        fontSize: '15px',
        border: `1px solid ${error ? 'var(--red)' : 'var(--line)'}`,
        borderRadius: '8px',
        resize: 'vertical',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
      }}
      {...props}
    />
  );
}