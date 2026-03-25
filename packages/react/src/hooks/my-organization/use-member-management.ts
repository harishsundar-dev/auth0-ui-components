/**
 * Member management state hook.
 * @module use-member-management
 */

import { useCallback, useState } from 'react';

import type {
  ConfirmModalState,
  MemberManagementTab,
  UseMemberManagementReturn,
} from '@/types/my-organization/member-management';

/**
 * Hook for managing top-level member management UI state.
 *
 * Manages active tab, member selection, confirmation modals, and the
 * currently-viewed member detail.  Switching tabs automatically resets
 * selection and dismisses any open confirmation modal.
 *
 * @returns State and setters for the member management block.
 */
export function useMemberManagement(): UseMemberManagementReturn {
  const [activeTab, setActiveTabState] = useState<MemberManagementTab>('members');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  const setActiveTab = useCallback((tab: MemberManagementTab) => {
    setActiveTabState(tab);
    setSelectedMemberIds([]);
    setConfirmModal(null);
  }, []);

  return {
    activeTab,
    setActiveTab,
    selectedMemberIds,
    setSelectedMemberIds,
    confirmModal,
    setConfirmModal,
    activeMemberId,
    setActiveMemberId,
  };
}
