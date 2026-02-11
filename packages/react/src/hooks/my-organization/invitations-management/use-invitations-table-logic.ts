import { type Invitation } from '@auth0/universal-components-core';
import { useCallback, useEffect, useState } from 'react';

import { showToast } from '../../../components/ui/toast';
import type {
  UseInvitationsTableLogicOptions,
  UseInvitationsTableLogicResult,
} from '../../../types/my-organization/invitations-management/invitations-table-types';
import { useErrorHandler } from '../../use-error-handler';

export function useInvitationsTableLogic({
  t,
  onCreateInvitation,
  onResendInvitation,
  onDeleteInvitation,
  fetchInvitations,
  onTabChange,
  defaultTab = 'invitations',
}: UseInvitationsTableLogicOptions): UseInvitationsTableLogicResult {
  const { handleError } = useErrorHandler();
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>(defaultTab);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

  const handleCreate = useCallback(
    async (emails: string[], roles: string[]) => {
      try {
        const invitations = await onCreateInvitation(emails, roles);
        if (invitations) {
          showToast({
            type: 'success',
            message: t('invitations_table.notifications.invitation_create.success'),
          });
          setShowCreateModal(false);
        }
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('invitations_table.notifications.invitation_create.error'),
        });
      }
    },
    [onCreateInvitation, t, handleError],
  );

  const handleResend = useCallback(
    async (invitation: Invitation) => {
      try {
        const result = await onResendInvitation(invitation);
        if (result) {
          showToast({
            type: 'success',
            message: t('invitations_table.notifications.invitation_resend.success'),
          });
        }
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('invitations_table.notifications.invitation_resend.error'),
        });
      }
    },
    [onResendInvitation, t, handleError],
  );

  const handleDelete = useCallback(
    async (invitation: Invitation) => {
      try {
        await onDeleteInvitation(invitation);
        showToast({
          type: 'success',
          message: t('invitations_table.notifications.invitation_delete.success'),
        });
        setShowDeleteModal(false);
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('invitations_table.notifications.invitation_delete.error'),
        });
      }
    },
    [onDeleteInvitation, t, handleError],
  );

  const handleCreateClick = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleResendClick = useCallback((invitation: Invitation) => {
    handleResend(invitation);
  }, [handleResend]);

  const handleDeleteClick = useCallback((invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setShowDeleteModal(true);
  }, []);

  const handleTabChange = useCallback(
    (tab: 'members' | 'invitations') => {
      setActiveTab(tab);
      onTabChange?.(tab);
    },
    [onTabChange],
  );

  // Initialization
  useEffect(() => {
    try {
      fetchInvitations();
    } catch (error) {
      handleError(error, {
        fallbackMessage: t('invitations_table.notifications.fetch_invitations_error'),
      });
    }
  }, []);

  return {
    // Tab state
    activeTab,
    setActiveTab: handleTabChange,

    // Modal state
    showCreateModal,
    showDeleteModal,
    selectedInvitation,

    // State setters
    setShowCreateModal,
    setShowDeleteModal,

    // Handlers
    handleCreate,
    handleResend,
    handleDelete,
    handleCreateClick,
    handleResendClick,
    handleDeleteClick,
  };
}
