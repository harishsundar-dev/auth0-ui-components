/**
 * Alert banner for error, warning, and success states.
 * @module invite-form-alert-banner
 * @internal
 */

import { AlertCircleIcon, CheckCircleIcon, TriangleAlertIcon } from 'lucide-react';
import * as React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { InviteStatus } from '@/types/my-organization/member-management/member-management-types';

interface InviteFormAlertBannerProps {
  status: InviteStatus;
  message: string | null;
  /** Label for the cancel action (warning state). */
  cancelLabel: string;
  /** Label for the send-anyway action (warning state). */
  sendAnywayLabel: string;
  onDismiss: () => void;
  onSendAnyway: () => void;
}

/**
 * Renders contextual alert banners for error, warning, and success states.
 * @param props - Component props
 * @returns Alert banner element or null
 * @internal
 */
export function InviteFormAlertBanner({
  status,
  message,
  cancelLabel,
  sendAnywayLabel,
  onDismiss,
  onSendAnyway,
}: InviteFormAlertBannerProps): React.JSX.Element | null {
  if (status === 'idle' || status === 'loading' || status === 'validating') return null;
  if (!message) return null;

  if (status === 'success') {
    return (
      <Alert variant="success" role="status">
        <CheckCircleIcon />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  if (status === 'warning') {
    return (
      <Alert variant="warning">
        <TriangleAlertIcon />
        <AlertTitle>{message}</AlertTitle>
        <AlertDescription>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" size="sm" onClick={onDismiss} type="button">
              {cancelLabel}
            </Button>
            <Button variant="primary" size="sm" onClick={onSendAnyway} type="button">
              {sendAnywayLabel}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // error state
  return (
    <Alert variant="destructive" role="alert">
      <AlertCircleIcon />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
