import React from 'react';
import './Input.css';

export default function Input({
  label,
  error,
  helpText,
  id,
  ...rest
}) {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...rest}
      />
      {error && <p className="input-error-text">{error}</p>}
      {helpText && <p className="input-help-text">{helpText}</p>}
    </div>
  );
}
