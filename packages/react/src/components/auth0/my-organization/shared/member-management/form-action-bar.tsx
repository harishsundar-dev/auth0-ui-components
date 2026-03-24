/**
 * Action bar with Cancel and Send Invite buttons.
 * @module form-action-bar
 * @internal
 */

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface FormActionBarProps {
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  cancelLabel: string;
  sendInviteLabel: string;
  sendingLabel: string;
}

/**
 * Bottom action row containing Cancel and Send Invite buttons.
 * Replaces Send Invite with a spinner while loading.
 * @param props - Component props
 * @returns Form action bar element
 * @internal
 */
export function FormActionBar({
  onCancel,
  onSubmit,
  isLoading,
  isDisabled,
  cancelLabel,
  sendInviteLabel,
  sendingLabel,
}: FormActionBarProps): React.JSX.Element {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onCancel} disabled={isLoading} type="button">
        {cancelLabel}
      </Button>
      <Button
        variant="primary"
        onClick={onSubmit}
        disabled={isDisabled || isLoading}
        aria-busy={isLoading}
        type="button"
      >
        {isLoading ? (
          <>
            <Spinner size="sm" aria-hidden="true" />
            {sendingLabel}
          </>
        ) : (
          sendInviteLabel
        )}
      </Button>
    </div>
  );
}
