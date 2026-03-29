/**
 * Invite member dialog shell.
 * @module invite-member-dialog
 * @internal
 */

import * as React from 'react';

import { AsyncStatusAnnouncer } from '@/components/auth0/my-organization/shared/member-management/async-status-announcer';
import { InviteFormAlertBanner } from '@/components/auth0/my-organization/shared/member-management/invite-form-alert-banner';
import { InviteMemberForm } from '@/components/auth0/my-organization/shared/member-management/invite-member-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  EmailInputMode,
  InviteMemberState,
  OrganizationRole,
  RoleInputVariant,
} from '@/types/my-organization/member-management/member-management-types';

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  state: InviteMemberState;
  roles: OrganizationRole[];
  isRolesLoading: boolean;
  mode: EmailInputMode;
  roleInputVariant: RoleInputVariant;
  onEmailChange: (email: string) => void;
  onAddEmailChip: (email: string) => void;
  onRemoveEmailChip: (email: string) => void;
  onRoleChange: (role: string) => void;
  onSubmit: () => void;
  onDismissAlert: () => void;
  onSendAnyway: () => void;
  dialogTitle: string;
  dialogDescription: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailHelperText: string;
  roleLabel: string;
  rolePlaceholder: string;
  cancelLabel: string;
  sendInviteLabel: string;
  sendingLabel: string;
  sendAnywayLabel: string;
  announceMessage: string | null;
}

/**
 * Modal dialog shell for the invite member form.
 * @param props - Component props
 * @returns Invite member dialog element
 * @internal
 */
export function InviteMemberDialog({
  open,
  onClose,
  state,
  roles,
  isRolesLoading,
  mode,
  roleInputVariant,
  onEmailChange,
  onAddEmailChip,
  onRemoveEmailChip,
  onRoleChange,
  onSubmit,
  onDismissAlert,
  onSendAnyway,
  dialogTitle,
  dialogDescription,
  emailLabel,
  emailPlaceholder,
  emailHelperText,
  roleLabel,
  rolePlaceholder,
  cancelLabel,
  sendInviteLabel,
  sendingLabel,
  sendAnywayLabel,
  announceMessage,
}: InviteMemberDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {dialogDescription && <DialogDescription>{dialogDescription}</DialogDescription>}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <InviteFormAlertBanner
            status={state.status}
            message={state.errorMsg ?? state.warnMsg}
            cancelLabel={cancelLabel}
            sendAnywayLabel={sendAnywayLabel}
            onDismiss={onDismissAlert}
            onSendAnyway={onSendAnyway}
          />

          <InviteMemberForm
            state={state}
            roles={roles}
            isRolesLoading={isRolesLoading}
            mode={mode}
            roleInputVariant={roleInputVariant}
            onEmailChange={onEmailChange}
            onAddEmailChip={onAddEmailChip}
            onRemoveEmailChip={onRemoveEmailChip}
            onRoleChange={onRoleChange}
            onSubmit={onSubmit}
            onCancel={onClose}
            emailLabel={emailLabel}
            emailPlaceholder={emailPlaceholder}
            emailHelperText={emailHelperText}
            roleLabel={roleLabel}
            rolePlaceholder={rolePlaceholder}
            cancelLabel={cancelLabel}
            sendInviteLabel={sendInviteLabel}
            sendingLabel={sendingLabel}
          />
        </div>

        <AsyncStatusAnnouncer message={announceMessage} />
      </DialogContent>
    </Dialog>
  );
}
