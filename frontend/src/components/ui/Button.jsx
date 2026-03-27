import React from 'react';
import './Button.css';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size} ${className}`}
      data-testid={`btn-${variant}`}
      {...rest}
    >
      {loading ? '...' : children}
    </button>
  );
}
