import * as React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';

import { inviteMemberSchema } from '../../MemberManagement.schema';
import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationRole, OrganizationSDKClient } from '../../MemberManagement.types';
import { RoleFilterDropdown } from '../shared/RoleFilterDropdown';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: OrganizationSDKClient;
  availableRoles: OrganizationRole[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function InviteMemberDialog({
  isOpen,
  onClose,
  client,
  availableRoles,
  onSuccess,
  onError,
}: InviteMemberDialogProps): React.JSX.Element {
  const msgs = defaultMessages.dialogs.inviteMember;
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setEmail('');
    setEmailError('');
    setSelectedRoleId('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const result = inviteMemberSchema.safeParse({
      email,
      roles: selectedRoleId ? [selectedRoleId] : undefined,
    });

    if (!result.success) {
      const emailIssue = result.error.issues.find((i) => i.path[0] === 'email');
      setEmailError(emailIssue?.message ?? 'Invalid email');
      return;
    }

    setIsLoading(true);
    try {
      await client.organization.invitations.create({
        invitee: { email: result.data.email },
        roles: result.data.roles,
      });
      onSuccess(msgs.success);
      handleClose();
    } catch {
      onError(msgs.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{msgs.title}</DialogTitle>
          <DialogDescription>{msgs.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite-email" className="text-sm font-medium">
              {msgs.emailLabel}
            </label>
            <TextField
              id="invite-email"
              type="email"
              placeholder={msgs.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              disabled={isLoading}
            />
          </div>
          {availableRoles.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{msgs.rolesLabel}</label>
              <RoleFilterDropdown
                value={selectedRoleId}
                onChange={setSelectedRoleId}
                roles={availableRoles}
                label={msgs.rolesLabel}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {msgs.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading} aria-busy={isLoading}>
              {isLoading && <Spinner size="sm" className="mr-2" aria-hidden="true" />}
              {msgs.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
