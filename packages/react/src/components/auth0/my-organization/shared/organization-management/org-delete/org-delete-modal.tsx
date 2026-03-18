/**
 * Organization deletion confirmation modal with type-to-confirm pattern.
 * @module org-delete-modal
 * @internal
 */

import * as React from 'react';

import { Modal } from '@/components/ui/modal';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrgManagementProps } from '@/types/my-organization/org-management/org-management-types';

export interface OrgDeleteModalProps {
  isOpen: boolean;
  orgName: string | null;
  isLoading: boolean;
  customMessages?: OrgManagementProps['customMessages'];
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * OrgDeleteModal — type-to-confirm deletion dialog for organizations.
 * @param props - Component props
 * @param props.isOpen - Whether the modal is open
 * @param props.orgName - Name of the organization to delete
 * @param props.isLoading - Whether a deletion is in progress
 * @param props.customMessages - Custom translation message overrides
 * @param props.onClose - Callback to close the modal
 * @param props.onConfirm - Callback to confirm deletion
 * @returns JSX element
 * @internal
 */
export function OrgDeleteModal({
  isOpen,
  orgName,
  isLoading,
  customMessages,
  onClose,
  onConfirm,
}: OrgDeleteModalProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.org_management', customMessages);
  const [confirmValue, setConfirmValue] = React.useState('');

  const isConfirmed = Boolean(orgName && confirmValue === orgName);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        setConfirmValue('');
        onClose();
      }
    },
    [onClose],
  );

  const handleConfirm = React.useCallback(async () => {
    if (!isConfirmed) return;
    await onConfirm();
    setConfirmValue('');
  }, [isConfirmed, onConfirm]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={t('delete.modal_title', { organizationName: orgName ?? '' })}
      content={
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('delete.modal_description', { organizationName: orgName ?? '' })}
          </p>
          <div className="space-y-1">
            <label htmlFor="org-delete-confirm" className="text-sm font-medium">
              {t('delete.organization_name_field_label')}
            </label>
            <TextField
              id="org-delete-confirm"
              placeholder={t('delete.organization_name_field_placeholder')}
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              disabled={isLoading}
              error={Boolean(confirmValue && !isConfirmed)}
            />
            {confirmValue && !isConfirmed && (
              <p className="text-sm text-destructive" role="alert">
                {t('delete.organization_name_field_error', { organizationName: orgName ?? '' })}
              </p>
            )}
          </div>
        </div>
      }
      modalActions={{
        isLoading,
        hasUnsavedChanges: true,
        showPrevious: true,
        showUnsavedChanges: false,
        nextAction: {
          type: 'button',
          label: t('delete.delete_button_label'),
          variant: 'destructive',
          disabled: !isConfirmed || isLoading,
          onClick: handleConfirm,
        },
        previousAction: {
          label: t('delete.cancel_button_label'),
          disabled: isLoading,
          onClick: onClose,
        },
      }}
    />
  );
}
