import * as React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { MemberManagementProvider, useMemberManagement } from './context/MemberManagementContext';
import { defaultMessages } from './MemberManagement.i18n';
import type { MemberManagementProps } from './MemberManagement.types';
import { MemberDetailPage } from './components/MemberDetailPage/MemberDetailPage';
import { InvitationsTab } from './components/InvitationsTab/InvitationsTab';
import { MembersTab } from './components/MembersTab/MembersTab';
import { ToastNotification } from './components/shared/ToastNotification';

function MemberManagementInner(): React.JSX.Element {
  const { activeTab, setActiveTab, detailUserId, toastQueue, dismissToast } =
    useMemberManagement();
  const msgs = defaultMessages.tabs;

  if (detailUserId) {
    return (
      <>
        <MemberDetailPage />
        <ToastNotification toasts={toastQueue} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'members' | 'invitations')}>
        <TabsList>
          <TabsTrigger value="members">{msgs.members}</TabsTrigger>
          <TabsTrigger value="invitations">{msgs.invitations}</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <MembersTab />
        </TabsContent>
        <TabsContent value="invitations" className="mt-4">
          <InvitationsTab />
        </TabsContent>
      </Tabs>
      <ToastNotification toasts={toastQueue} onDismiss={dismissToast} />
    </>
  );
}

export function MemberManagement({
  client,
  orgId,
  orgName,
  defaultTab = 'members',
  className,
}: MemberManagementProps): React.JSX.Element {
  return (
    <MemberManagementProvider
      client={client}
      orgId={orgId}
      orgName={orgName}
      defaultTab={defaultTab}
    >
      <div className={cn('flex flex-col gap-4', className)}>
        <MemberManagementInner />
      </div>
    </MemberManagementProvider>
  );
}
