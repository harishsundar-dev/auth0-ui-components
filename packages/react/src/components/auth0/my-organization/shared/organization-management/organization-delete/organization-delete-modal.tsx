/**
 * Organization deletion modal.
 * @module organization-delete-modal
 * @internal
 */

import type {
  OrganizationDeleteMessages,
  OrganizationPrivate,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';

interface OrganizationDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: OrganizationPrivate;
  onDelete: (confirmationText: string, organization: OrganizationPrivate) => Promise<void>;
  isLoading?: boolean;
  customMessages?: OrganizationDeleteMessages;
}

/**
 * Modal for confirming organization deletion. Requires the user to type the
 * organization name before the delete action is enabled.
 * @param props - Component props
 * @param props.isOpen - Whether the modal is open
 * @param props.onClose - Callback fired when the modal should close
 * @param props.organization - The organization to be deleted
 * @param props.onDelete - Callback fired when deletion is confirmed
 * @param props.isLoading - Whether the deletion is in progress
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function OrganizationDeleteModal({
  isOpen,
  onClose,
  organization,
  onDelete,
  isLoading = false,
  customMessages = {},
}: OrganizationDeleteModalProps) {
  const { t } = useTranslator('organization_management.organization_delete', customMessages);
  const [confirmationText, setConfirmationText] = React.useState('');

  const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationText(event.target.value);
  }, []);

  const handleDelete = React.useCallback(async () => {
    await onDelete(confirmationText, organization);
  }, [onDelete, confirmationText, organization]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  React.useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  const isNameMismatch = confirmationText.length > 0 && confirmationText !== organization.name;

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
      className="p-10"
      title={t('modal_title', { organizationName: organization.display_name || organization.name })}
      content={
        <div className="space-y-6">
          <p className={cn('text-sm text-muted-foreground text-(length:--font-size-paragraph)')}>
            {t('modal_description', {
              organizationName: organization.display_name || organization.name,
            })}
          </p>
          <div className="space-y-2">
            <Label
              htmlFor="organization-name-confirmation"
              className="text-sm text-(length:--font-size-label) font-medium"
            >
              {t('organization_name_field_label')}
            </Label>
            <TextField
              id="organization-name-confirmation"
              type="text"
              placeholder={t('organization_name_field_placeholder')}
              value={confirmationText}
              onChange={handleInputChange}
              error={isNameMismatch}
            />
            {isNameMismatch && (
              <p className="text-sm text-destructive" role="alert">
                {t('organization_name_field_error', { organizationName: organization.name })}
              </p>
            )}
          </div>
        </div>
      }
      modalActions={{
        isLoading,
        nextAction: {
          type: 'button',
          label: t('delete_button_label'),
          onClick: handleDelete,
          variant: 'destructive',
          disabled: isLoading || confirmationText !== organization.name,
        },
        previousAction: {
          label: t('cancel_button_label'),
          onClick: onClose,
        },
      }}
    />
  );
}
