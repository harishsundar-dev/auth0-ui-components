import { ArrowLeftIcon } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useMemberManagement } from '../../context/MemberManagementContext';
import { useMemberDetail } from '../../hooks/useMemberDetail';
import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationRole } from '../../MemberManagement.types';
import { ConfirmationDialog } from '../dialogs/ConfirmationDialog';
import { MemberDangerZone } from './MemberDangerZone';
import { MemberDetailsTab } from './MemberDetailsTab';
import { MemberRolesTab } from './MemberRolesTab';

export function MemberDetailPage(): React.JSX.Element | null {
  const { client, detailUserId, setDetailUserId, pushToast } = useMemberManagement();
  const msgs = defaultMessages;

  const { member, roles, isLoading, error, refetch } = useMemberDetail(client, detailUserId);
  const [availableRoles, setAvailableRoles] = useState<OrganizationRole[]>([]);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isLoading: boolean;
    error: string | null;
  } | null>(null);

  const [removeConfirm, setRemoveConfirm] = useState<{
    isLoading: boolean;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!client) return;
    client.organization.roles
      .list()
      .then(setAvailableRoles)
      .catch(() => {
        // silent fail
      });
  }, [client]);

  if (!detailUserId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" aria-label={msgs.common.loading} />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-destructive-foreground">{error ?? msgs.common.error}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          {msgs.common.retry}
        </Button>
      </div>
    );
  }

  const confirmDelete = async () => {
    setDeleteConfirm((prev) => prev && { ...prev, isLoading: true, error: null });
    try {
      await client.organization.members.deleteMembers({ members: [member.user_id] });
      pushToast(`${member.name ?? 'Member'} deleted successfully`, 'success');
      setDeleteConfirm(null);
      setDetailUserId(null);
    } catch {
      setDeleteConfirm((prev) => prev && { ...prev, isLoading: false, error: msgs.common.error });
    }
  };

  const confirmRemove = async () => {
    setRemoveConfirm((prev) => prev && { ...prev, isLoading: true, error: null });
    try {
      await client.organization.memberships.deleteMemberships({ members: [member.user_id] });
      pushToast(`${member.name ?? 'Member'} removed from organization`, 'success');
      setRemoveConfirm(null);
      setDetailUserId(null);
    } catch {
      setRemoveConfirm((prev) => prev && { ...prev, isLoading: false, error: msgs.common.error });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDetailUserId(null)}
        className="self-start"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {msgs.memberDetail.backToMembers}
      </Button>

      <div className="flex items-center gap-4">
        {member.picture && (
          <img
            src={member.picture}
            alt=""
            className="size-12 rounded-full object-cover shrink-0"
            aria-hidden="true"
          />
        )}
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">
            {member.name ?? member.email ?? member.user_id}
          </h2>
          {member.name && member.email && (
            <span className="text-sm text-muted-foreground">{member.email}</span>
          )}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">{msgs.memberDetail.tabs.details}</TabsTrigger>
          <TabsTrigger value="roles">{msgs.memberDetail.tabs.roles}</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4">
          <MemberDetailsTab member={member} />
        </TabsContent>
        <TabsContent value="roles" className="mt-4">
          <MemberRolesTab
            userId={member.user_id}
            roles={roles}
            availableRoles={availableRoles}
            onRolesChanged={refetch}
          />
        </TabsContent>
      </Tabs>

      <MemberDangerZone
        onRemoveFromOrg={() => setRemoveConfirm({ isLoading: false, error: null })}
        onDeleteMember={() => setDeleteConfirm({ isLoading: false, error: null })}
      />

      {deleteConfirm && (
        <ConfirmationDialog
          isOpen={!!deleteConfirm}
          title={msgs.dialogs.confirmDeleteMember.title}
          description={msgs.dialogs.confirmDeleteMember.description.replace(
            '{name}',
            member.name ?? member.email ?? 'this member',
          )}
          confirmLabel={msgs.dialogs.confirmDeleteMember.confirm}
          cancelLabel={msgs.dialogs.confirmDeleteMember.cancel}
          isLoading={deleteConfirm.isLoading}
          error={deleteConfirm.error}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {removeConfirm && (
        <ConfirmationDialog
          isOpen={!!removeConfirm}
          title={msgs.dialogs.confirmRemoveMember.title}
          description={msgs.dialogs.confirmRemoveMember.description.replace(
            '{name}',
            member.name ?? member.email ?? 'this member',
          )}
          confirmLabel={msgs.dialogs.confirmRemoveMember.confirm}
          cancelLabel={msgs.dialogs.confirmRemoveMember.cancel}
          isLoading={removeConfirm.isLoading}
          error={removeConfirm.error}
          onConfirm={() => void confirmRemove()}
          onCancel={() => setRemoveConfirm(null)}
        />
      )}
    </div>
  );
}
