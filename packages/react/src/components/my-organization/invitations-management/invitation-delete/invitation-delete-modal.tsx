import type { Invitation, InvitationDeleteMessages } from '@auth0/universal-components-core';
import React from 'react';

import { useTranslator } from '../../../../hooks/use-translator';
import { cn } from '../../../../lib/theme-utils';
import { Modal } from '../../../ui/modal';

export interface InvitationDeleteModalProps {
  translatorKey?: string;
  className?: string;
  customMessages?: Partial<InvitationDeleteMessages>;
  invitation: Invitation | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onDelete: (invitation: Invitation) => Promise<void>;
}

export function InvitationDeleteModal({
  translatorKey = 'invitations_management.invitation_delete.modal',
  className,
  customMessages,
  invitation,
  isOpen,
  isLoading,
  onClose,
  onDelete,
}: InvitationDeleteModalProps) {
  const { t } = useTranslator(translatorKey, customMessages);

  const handleDelete = React.useCallback(() => {
    if (invitation) {
      onDelete(invitation);
    }
  }, [onDelete, invitation]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className={cn('p-10', className)}
      title={t('title')}
      content={
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">{t('description')}</p>
          {invitation && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('email_label')}</p>
              <p className="text-sm font-medium">{invitation.invitee.email}</p>
            </div>
          )}
        </div>
      }
      modalActions={{
        isLoading,
        nextAction: {
          type: 'button',
          label: isLoading ? t('actions.deleting_button_text') : t('actions.delete_button_text'),
          variant: 'destructive',
          disabled: isLoading,
          onClick: handleDelete,
        },
        previousAction: {
          label: t('actions.cancel_button_text'),
          onClick: onClose,
        },
      }}
    />
  );
}
