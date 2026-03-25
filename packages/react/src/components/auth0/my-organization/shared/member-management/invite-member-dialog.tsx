/**
 * Invite member dialog for sending organization invitations.
 * @module invite-member-dialog
 */

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { MemberManagementMessages } from '@/types/my-organization/member-management';

export interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (email: string) => void;
  isSubmitting?: boolean;
  customMessages?: Partial<MemberManagementMessages>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Dialog for inviting a new member by email.
 * @param root0 - The component props.
 * @returns The invite member dialog element.
 */
export function InviteMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  customMessages = {},
}: InviteMemberDialogProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = email.trim();

      if (!EMAIL_REGEX.test(trimmed)) {
        setEmailError(t('invite_member.invalid_email'));
        return;
      }

      setEmailError('');
      onSubmit(trimmed);
    },
    [email, onSubmit, t],
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setEmail('');
        setEmailError('');
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('invite_member.title')}</DialogTitle>
            <DialogDescription>{t('invite_member.description')}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium" htmlFor="invite-email">
              {t('invite_member.email_label')}
            </label>
            <TextField
              id="invite-email"
              type="email"
              placeholder={t('invite_member.email_placeholder')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'invite-email-error' : undefined}
            />
            {emailError && (
              <p id="invite-email-error" className="mt-1 text-sm text-destructive">
                {emailError}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose disabled={isSubmitting}>{t('invite_member.cancel')}</DialogClose>
            <Button type="submit" disabled={isSubmitting || !email.trim()}>
              {t('invite_member.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
