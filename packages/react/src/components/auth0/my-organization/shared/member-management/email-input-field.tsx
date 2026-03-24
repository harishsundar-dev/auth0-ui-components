/**
 * Email input field for single-email variant.
 * @module email-input-field
 * @internal
 */

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { TextField } from '@/components/ui/text-field';

interface EmailInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Single email text input with label and inline error.
 * @param props - Component props
 * @returns Email input field element
 * @internal
 */
export function EmailInputField({
  value,
  onChange,
  label,
  placeholder,
  helperText,
  error,
  disabled,
}: EmailInputFieldProps): React.JSX.Element {
  const inputId = 'invite-member-email';

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <TextField
        id={inputId}
        type="email"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        disabled={disabled}
        error={!!error}
      />
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-muted-foreground text-xs">
          {helperText}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-destructive-foreground text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
