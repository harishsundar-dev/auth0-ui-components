/**
 * Multi-email chip/tag input for multi-email variant.
 * @module email-chip-input
 * @internal
 */

import { XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TextField } from '@/components/ui/text-field';

interface EmailChipInputProps {
  emails: string[];
  onAdd: (email: string) => void;
  onRemove: (email: string) => void;
  label: string;
  placeholder: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Tag/chip email input that allows multiple email addresses.
 * Press Enter or comma to add a chip.
 * @param props - Component props
 * @returns Email chip input element
 * @internal
 */
export function EmailChipInput({
  emails,
  onAdd,
  onRemove,
  label,
  placeholder,
  helperText,
  error,
  disabled,
}: EmailChipInputProps): React.JSX.Element {
  const [inputValue, setInputValue] = React.useState('');
  const inputId = 'invite-member-emails';

  const commitChip = React.useCallback(() => {
    const trimmed = inputValue.trim().replace(/,$/, '');
    if (trimmed && EMAIL_REGEX.test(trimmed)) {
      onAdd(trimmed);
      setInputValue('');
    }
  }, [inputValue, onAdd]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitChip();
    } else if (e.key === 'Backspace' && inputValue === '' && emails.length > 0) {
      const lastEmail = emails[emails.length - 1];
      if (lastEmail) onRemove(lastEmail);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <div
        className="bg-input border-border/50 flex min-h-10 flex-wrap items-center gap-1 rounded-2xl border px-3 py-1.5"
        aria-invalid={!!error}
      >
        {emails.map((email) => (
          <span
            key={email}
            className="bg-muted text-muted-foreground flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs"
          >
            {email}
            <Button
              variant="ghost"
              size="icon"
              className="size-4"
              onClick={() => onRemove(email)}
              disabled={disabled}
              aria-label={`Remove ${email}`}
              type="button"
            >
              <XIcon className="size-3" />
            </Button>
          </span>
        ))}
        <TextField
          id={inputId}
          type="email"
          value={inputValue}
          placeholder={emails.length === 0 ? placeholder : ''}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitChip}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          disabled={disabled}
          className="min-w-32 flex-1 border-none shadow-none"
        />
      </div>
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
