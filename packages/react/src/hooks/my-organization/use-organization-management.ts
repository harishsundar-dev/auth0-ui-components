/**
 * Organization management hook.
 * @module use-organization-management
 */

import type { OrganizationPrivate } from '@auth0/universal-components-core';
import { useCallback, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  UseOrganizationManagementOptions,
  UseOrganizationManagementResult,
} from '@/types/my-organization/organization-management/organization-management-types';

/**
 * Hook for managing organization-level state including delete flow.
 * @param props - Hook options
 * @param props.deleteAction - Configuration for the delete action
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns Hook state and methods
 */
export function useOrganizationManagement({
  deleteAction,
  customMessages = {},
}: UseOrganizationManagementOptions): UseOrganizationManagementResult {
  const { t } = useTranslator(
    'organization_management.organization_delete',
    customMessages?.delete,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handleDeleteConfirm = useCallback(
    async (_organizationName: string, organization: OrganizationPrivate) => {
      if (!deleteAction) return;

      setIsDeleting(true);
      try {
        await deleteAction.onAfter?.(organization);
        setIsDeleteModalOpen(false);
      } catch (error) {
        showToast({
          type: 'error',
          message: error instanceof Error ? error.message : t('delete_error_generic'),
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteAction, t],
  );

  return {
    isDeleteModalOpen,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteConfirm,
  };
}
