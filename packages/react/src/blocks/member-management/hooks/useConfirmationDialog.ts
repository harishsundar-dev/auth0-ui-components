import { useCallback } from 'react';

import { useMemberManagement } from '../context/MemberManagementContext';
import type { ConfirmationDialogType } from '../MemberManagement.types';

/**
 *
 */
export function useConfirmationDialog() {
  const { confirmationDialog, setConfirmationDialog } = useMemberManagement();

  const openDialog = useCallback(
    (type: ConfirmationDialogType, payload: Record<string, unknown>) => {
      setConfirmationDialog({ type, payload, isLoading: false, error: null });
    },
    [setConfirmationDialog],
  );

  const closeDialog = useCallback(() => {
    setConfirmationDialog(null);
  }, [setConfirmationDialog]);

  const setLoading = useCallback(
    (isLoading: boolean) => {
      if (!confirmationDialog) return;
      setConfirmationDialog({ ...confirmationDialog, isLoading });
    },
    [confirmationDialog, setConfirmationDialog],
  );

  const setError = useCallback(
    (error: string | null) => {
      if (!confirmationDialog) return;
      setConfirmationDialog({ ...confirmationDialog, error });
    },
    [confirmationDialog, setConfirmationDialog],
  );

  return { confirmationDialog, openDialog, closeDialog, setLoading, setError };
}
