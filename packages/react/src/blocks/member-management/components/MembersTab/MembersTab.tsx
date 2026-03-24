import { PlusIcon } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { useMemberManagement } from '../../context/MemberManagementContext';
import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationMember, OrganizationRole } from '../../MemberManagement.types';
import { AssignRolesDialog } from '../dialogs/AssignRolesDialog';
import { ConfirmationDialog } from '../dialogs/ConfirmationDialog';
import { InviteMemberDialog } from '../dialogs/InviteMemberDialog';
import { Pagination } from '../shared/Pagination';
import { MemberBulkToolbar } from './MemberBulkToolbar';
import { MemberSearchBar } from './MemberSearchBar';
import { MembersTable } from './MembersTable';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import { useMemberSearch } from '../../hooks/useMemberSearch';
import { useMembersList } from '../../hooks/useMembersList';

export function MembersTab(): React.JSX.Element {
  const { client, pushToast, setDetailUserId } = useMemberManagement();
  const msgs = defaultMessages;

  const [pageSize, setPageSize] = useState(10);
  const { searchQuery, setSearchQuery, debouncedQuery } = useMemberSearch();
  const {
    members,
    isLoading,
    error,
    total,
    canGoNext,
    canGoPrevious,
    goToNextPage,
    goToPreviousPage,
    refetch,
  } = useMembersList(client, pageSize, debouncedQuery);

  const {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isIndeterminate,
  } = useBulkSelection();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [assignRolesTarget, setAssignRolesTarget] = useState<OrganizationMember | null>(null);
  const [availableRoles, setAvailableRoles] = useState<OrganizationRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    member?: OrganizationMember;
    isBulk?: boolean;
    isLoading: boolean;
    error: string | null;
  } | null>(null);

  const [removeConfirm, setRemoveConfirm] = useState<{
    member?: OrganizationMember;
    isBulk?: boolean;
    isLoading: boolean;
    error: string | null;
  } | null>(null);

  const loadRoles = async () => {
    if (availableRoles.length > 0) return;
    setIsLoadingRoles(true);
    try {
      const roles = await client.organization.roles.list();
      setAvailableRoles(roles);
    } catch {
      // silent fail
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleInviteOpen = async () => {
    await loadRoles();
    setIsInviteOpen(true);
  };

  const handleAssignRole = async (member: OrganizationMember) => {
    await loadRoles();
    setAssignRolesTarget(member);
  };

  const handleDeleteMember = (member: OrganizationMember) => {
    setDeleteConfirm({ member, isBulk: false, isLoading: false, error: null });
  };

  const handleDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirm({ isBulk: true, isLoading: false, error: null });
  };

  const handleRemoveMember = (member: OrganizationMember) => {
    setRemoveConfirm({ member, isBulk: false, isLoading: false, error: null });
  };

  const handleRemoveBulk = () => {
    if (selectedIds.length === 0) return;
    setRemoveConfirm({ isBulk: true, isLoading: false, error: null });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteConfirm((prev) => prev && { ...prev, isLoading: true, error: null });
    try {
      const ids = deleteConfirm.isBulk ? selectedIds : [deleteConfirm.member?.user_id ?? ''];
      if (ids.some((id) => !id)) return;
      await client.organization.members.deleteMembers({ members: ids });
      pushToast(
        deleteConfirm.isBulk
          ? `${ids.length} members deleted successfully`
          : `${deleteConfirm.member?.name ?? 'Member'} deleted successfully`,
        'success',
      );
      clearSelection();
      setDeleteConfirm(null);
      refetch();
    } catch {
      setDeleteConfirm((prev) => prev && { ...prev, isLoading: false, error: msgs.common.error });
    }
  };

  const confirmRemove = async () => {
    if (!removeConfirm) return;
    setRemoveConfirm((prev) => prev && { ...prev, isLoading: true, error: null });
    try {
      const ids = removeConfirm.isBulk ? selectedIds : [removeConfirm.member?.user_id ?? ''];
      if (ids.some((id) => !id)) return;
      await client.organization.memberships.deleteMemberships({ members: ids });
      pushToast(
        removeConfirm.isBulk
          ? `${ids.length} members removed successfully`
          : `${removeConfirm.member?.name ?? 'Member'} removed successfully`,
        'success',
      );
      clearSelection();
      setRemoveConfirm(null);
      refetch();
    } catch {
      setRemoveConfirm((prev) => prev && { ...prev, isLoading: false, error: msgs.common.error });
    }
  };

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-destructive-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          {msgs.common.retry}
        </Button>
      </div>
    );
  }

  const allMemberIds = members.map((m) => m.user_id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <MemberSearchBar value={searchQuery} onChange={setSearchQuery} />
        <Button
          variant="primary"
          size="sm"
          onClick={() => void handleInviteOpen()}
          disabled={isLoadingRoles}
          aria-label={msgs.members.inviteMember}
        >
          {isLoadingRoles ? (
            <Spinner size="sm" aria-hidden="true" />
          ) : (
            <PlusIcon className="size-4" aria-hidden="true" />
          )}
          {msgs.members.inviteMember}
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <MemberBulkToolbar
          selectedCount={selectedIds.length}
          onRemove={handleRemoveBulk}
          onDelete={handleDeleteBulk}
          onClear={clearSelection}
        />
      )}

      <MembersTable
        members={members}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelection}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        isAllSelected={isAllSelected(allMemberIds)}
        isIndeterminate={isIndeterminate(allMemberIds)}
        onViewDetails={(m) => setDetailUserId(m.user_id)}
        onAssignRole={(m) => void handleAssignRole(m)}
        onRemoveFromOrg={handleRemoveMember}
        onDeleteMember={handleDeleteMember}
      />

      <Pagination
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        total={total}
        currentCount={members.length}
      />

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        client={client}
        availableRoles={availableRoles}
        onSuccess={(msg) => {
          pushToast(msg, 'success');
          refetch();
        }}
        onError={(msg) => pushToast(msg, 'error')}
      />

      {assignRolesTarget && (
        <AssignRolesDialog
          isOpen={!!assignRolesTarget}
          onClose={() => setAssignRolesTarget(null)}
          userId={assignRolesTarget.user_id}
          client={client}
          availableRoles={availableRoles}
          assignedRoleIds={assignRolesTarget.roles?.map((r) => r.id) ?? []}
          onSuccess={(msg) => {
            pushToast(msg, 'success');
            refetch();
          }}
          onError={(msg) => pushToast(msg, 'error')}
        />
      )}

      {deleteConfirm && (
        <ConfirmationDialog
          isOpen={!!deleteConfirm}
          title={
            deleteConfirm.isBulk
              ? msgs.dialogs.confirmDeleteMembersBulk.title
              : msgs.dialogs.confirmDeleteMember.title
          }
          description={
            deleteConfirm.isBulk
              ? msgs.dialogs.confirmDeleteMembersBulk.description.replace(
                  '{count}',
                  String(selectedIds.length),
                )
              : msgs.dialogs.confirmDeleteMember.description.replace(
                  '{name}',
                  deleteConfirm.member?.name ?? deleteConfirm.member?.email ?? 'this member',
                )
          }
          confirmLabel={
            deleteConfirm.isBulk
              ? msgs.dialogs.confirmDeleteMembersBulk.confirm
              : msgs.dialogs.confirmDeleteMember.confirm
          }
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
          title={
            removeConfirm.isBulk
              ? msgs.dialogs.confirmRemoveMembersBulk.title
              : msgs.dialogs.confirmRemoveMember.title
          }
          description={
            removeConfirm.isBulk
              ? msgs.dialogs.confirmRemoveMembersBulk.description.replace(
                  '{count}',
                  String(selectedIds.length),
                )
              : msgs.dialogs.confirmRemoveMember.description.replace(
                  '{name}',
                  removeConfirm.member?.name ?? removeConfirm.member?.email ?? 'this member',
                )
          }
          confirmLabel={
            removeConfirm.isBulk
              ? msgs.dialogs.confirmRemoveMembersBulk.confirm
              : msgs.dialogs.confirmRemoveMember.confirm
          }
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
