import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import type {
  ActiveTab,
  ConfirmationDialogState,
  MemberManagementContextValue,
  OrganizationSDKClient,
  Toast,
} from '../MemberManagement.types';

const MemberManagementContext = createContext<MemberManagementContextValue | null>(null);

export function useMemberManagement(): MemberManagementContextValue {
  const ctx = useContext(MemberManagementContext);
  if (!ctx) throw new Error('useMemberManagement must be used within MemberManagementProvider');
  return ctx;
}

interface MemberManagementProviderProps {
  children: React.ReactNode;
  client: OrganizationSDKClient;
  orgId: string;
  orgName: string;
  defaultTab?: ActiveTab;
}

export function MemberManagementProvider({
  children,
  client,
  orgId,
  orgName,
  defaultTab = 'members',
}: MemberManagementProviderProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<ActiveTab>(defaultTab);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [toastQueue, setToastQueue] = useState<Toast[]>([]);
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState | null>(
    null,
  );
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const toastTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const pushToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast: Toast = { id, message, type, duration: 5000 };
    setToastQueue((prev) => [...prev, toast]);
    const timer = setTimeout(() => {
      setToastQueue((prev) => prev.filter((t) => t.id !== id));
      toastTimersRef.current.delete(id);
    }, toast.duration);
    toastTimersRef.current.set(id, timer);
  }, []);

  const dismissToast = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
    setToastQueue((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue: MemberManagementContextValue = {
    activeTab,
    setActiveTab,
    selectedMemberIds,
    setSelectedMemberIds,
    orgName,
    orgId,
    client,
    toastQueue,
    pushToast,
    dismissToast,
    confirmationDialog,
    setConfirmationDialog,
    detailUserId,
    setDetailUserId,
  };

  return (
    <MemberManagementContext.Provider value={contextValue}>
      {children}
    </MemberManagementContext.Provider>
  );
}
