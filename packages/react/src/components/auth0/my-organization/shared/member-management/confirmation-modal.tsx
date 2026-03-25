/**
 * Generic confirmation dialog for member management actions.
 * @module confirmation-modal
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
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  ConfirmModalState,
  MemberManagementMessages,
} from '@/types/my-organization/member-management';

export interface ConfirmationModalProps {
  modal: ConfirmModalState;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
  customMessages?: Partial<MemberManagementMessages>;
}

export function ConfirmationModal({
  modal,
  onConfirm,
  onCancel,
  isConfirming = false,
  customMessages = {},
}: ConfirmationModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const content = React.useMemo(() => {
    switch (modal.type) {
      case 'revokeResend':
        return {
          title: t('confirmation.revoke_resend.title'),
          description: t('confirmation.revoke_resend.description', { email: modal.email }),
          confirm: t('confirmation.revoke_resend.confirm'),
          cancel: t('confirmation.revoke_resend.cancel'),
          destructive: true,
        };
      case 'revokeInvitation':
        return {
          title: t('confirmation.revoke_invitation.title'),
          description: t('confirmation.revoke_invitation.description', { email: modal.email }),
          confirm: t('confirmation.revoke_invitation.confirm'),
          cancel: t('confirmation.revoke_invitation.cancel'),
          destructive: true,
        };
      case 'deleteSingleMember':
        return {
          title: t('confirmation.delete_member.title'),
          description: t('confirmation.delete_member.description', {
            displayName: modal.displayName,
          }),
          confirm: t('confirmation.delete_member.confirm'),
          cancel: t('confirmation.delete_member.cancel'),
          destructive: true,
        };
      case 'bulkDeleteMembers':
        return {
          title: t('confirmation.bulk_delete.title'),
          description: t('confirmation.bulk_delete.description', {
            count: String(modal.userIds.length),
          }),
          confirm: t('confirmation.bulk_delete.confirm'),
          cancel: t('confirmation.bulk_delete.cancel'),
          destructive: true,
        };
      case 'removeSingleMember':
        return {
          title: t('confirmation.remove_member.title'),
          description: t('confirmation.remove_member.description', {
            displayName: modal.displayName,
            orgName: modal.orgName,
          }),
          confirm: t('confirmation.remove_member.confirm'),
          cancel: t('confirmation.remove_member.cancel'),
          destructive: true,
        };
      case 'bulkRemoveMembers':
        return {
          title: t('confirmation.bulk_remove.title'),
          description: t('confirmation.bulk_remove.description', {
            count: String(modal.userIds.length),
            orgName: modal.orgName,
          }),
          confirm: t('confirmation.bulk_remove.confirm'),
          cancel: t('confirmation.bulk_remove.cancel'),
          destructive: true,
        };
      case 'removeSingleRole':
        return {
          title: t('confirmation.remove_role.title'),
          description: t('confirmation.remove_role.description', {
            roleName: modal.roleName,
            memberName: modal.memberName,
          }),
          confirm: t('confirmation.remove_role.confirm'),
          cancel: t('confirmation.remove_role.cancel'),
          destructive: true,
        };
      case 'bulkRemoveRoles':
        return {
          title: t('confirmation.bulk_remove_roles.title'),
          description: t('confirmation.bulk_remove_roles.description', {
            count: String(modal.roleIds.length),
            memberName: modal.memberName,
          }),
          confirm: t('confirmation.bulk_remove_roles.confirm'),
          cancel: t('confirmation.bulk_remove_roles.cancel'),
          destructive: true,
        };
    }
  }, [modal, t]);

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel} disabled={isConfirming}>
              {content.cancel}
            </Button>
          </DialogClose>
          <Button
            variant={content.destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {content.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
