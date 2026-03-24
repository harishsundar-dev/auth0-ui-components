import * as React from 'react';
import { useState } from 'react';


import { useMemberManagement } from '../../context/MemberManagementContext';
import { useInvitationsFilter } from '../../hooks/useInvitationsFilter';
import { useInvitationsList } from '../../hooks/useInvitationsList';
import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationInvitation } from '../../MemberManagement.types';
import { ConfirmationDialog } from '../dialogs/ConfirmationDialog';
import { Pagination } from '../shared/Pagination';
import { RoleFilterDropdown } from '../shared/RoleFilterDropdown';

import { InvitationsTable } from './InvitationsTable';

import { Button } from '@/components/ui/button';

/**
 *
 */
export function InvitationsTab(): React.JSX.Element {
  const { client, pushToast } = useMemberManagement();
  const msgs = defaultMessages;

  const [pageSize, setPageSize] = useState(10);
  const { roleFilter, setRoleFilter, availableRoles, isLoadingRoles } =
    useInvitationsFilter(client);
  const {
    invitations,
    isLoading,
    error,
    total,
    canGoNext,
    canGoPrevious,
    goToNextPage,
    goToPreviousPage,
    refetch,
  } = useInvitationsList(client, pageSize, roleFilter);

  const [revokeConfirm, setRevokeConfirm] = useState<{
    invitation: OrganizationInvitation;
    isResend: boolean;
    isLoading: boolean;
    error: string | null;
  } | null>(null);

  const handleCopyUrl = async (invitation: OrganizationInvitation) => {
    if (!invitation.invitation_url) return;
    try {
      await navigator.clipboard.writeText(invitation.invitation_url);
      pushToast(msgs.invitations.urlCopied, 'success');
    } catch {
      pushToast(msgs.invitations.urlCopyFailed, 'error');
    }
  };

  const handleRevokeAndResend = (invitation: OrganizationInvitation) => {
    setRevokeConfirm({ invitation, isResend: true, isLoading: false, error: null });
  };

  const handleRevoke = (invitation: OrganizationInvitation) => {
    setRevokeConfirm({ invitation, isResend: false, isLoading: false, error: null });
  };

  const confirmRevoke = async () => {
    if (!revokeConfirm) return;
    setRevokeConfirm((prev) => prev && { ...prev, isLoading: true, error: null });
    try {
      await client.organization.invitations.delete(revokeConfirm.invitation.id);
      if (revokeConfirm.isResend) {
        await client.organization.invitations.create({
          invitee: { email: revokeConfirm.invitation.invitee.email },
        roles: revokeConfirm.invitation.roles?.map((r) => r.id) ?? undefined,
        });
      }
      pushToast(
        revokeConfirm.isResend
          ? 'Invitation revoked and resent successfully'
          : 'Invitation revoked successfully',
        'success',
      );
      setRevokeConfirm(null);
      refetch();
    } catch {
      setRevokeConfirm((prev) => prev && { ...prev, isLoading: false, error: msgs.common.error });
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <RoleFilterDropdown
          value={roleFilter}
          onChange={setRoleFilter}
          roles={availableRoles}
          isLoading={isLoadingRoles}
          label={msgs.invitations.filterByRole}
          placeholder={msgs.invitations.allRoles}
        />
      </div>

      <InvitationsTable
        invitations={invitations}
        isLoading={isLoading}
        onCopyUrl={(inv) => void handleCopyUrl(inv)}
        onRevokeAndResend={handleRevokeAndResend}
        onRevoke={handleRevoke}
      />

      <Pagination
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        total={total}
        currentCount={invitations.length}
      />

      {revokeConfirm && (
        <ConfirmationDialog
          isOpen={!!revokeConfirm}
          title={
            revokeConfirm.isResend
              ? msgs.dialogs.confirmRevokeResend.title
              : msgs.dialogs.confirmRevoke.title
          }
          description={
            revokeConfirm.isResend
              ? msgs.dialogs.confirmRevokeResend.description.replace(
                  '{email}',
                  revokeConfirm.invitation.invitee.email,
                )
              : msgs.dialogs.confirmRevoke.description.replace(
                  '{email}',
                  revokeConfirm.invitation.invitee.email,
                )
          }
          confirmLabel={
            revokeConfirm.isResend
              ? msgs.dialogs.confirmRevokeResend.confirm
              : msgs.dialogs.confirmRevoke.confirm
          }
          cancelLabel={msgs.dialogs.confirmRevoke.cancel}
          isLoading={revokeConfirm.isLoading}
          error={revokeConfirm.error}
          onConfirm={() => void confirmRevoke()}
          onCancel={() => setRevokeConfirm(null)}
        />
      )}
    </div>
  );
}
