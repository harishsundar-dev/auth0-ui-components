/** @module member-management */

import { getComponentStyles } from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { ConfirmationModal } from '@/components/auth0/my-organization/shared/member-management/confirmation-modal';
import { InvitationsTab } from '@/components/auth0/my-organization/shared/member-management/invitations-tab';
import { InviteMemberDialog } from '@/components/auth0/my-organization/shared/member-management/invite-member-dialog';
import { MemberDetail } from '@/components/auth0/my-organization/shared/member-management/member-detail';
import { MembersTab } from '@/components/auth0/my-organization/shared/member-management/members-tab';
import { showToast } from '@/components/auth0/shared/toast';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvitationsList } from '@/hooks/my-organization/use-invitations-list';
import { useMemberManagement } from '@/hooks/my-organization/use-member-management';
import { useMembersList } from '@/hooks/my-organization/use-members-list';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  MemberManagementProps,
  MemberManagementTab,
} from '@/types/my-organization/member-management';

const DEFAULT_PER_PAGE_OPTIONS = [10, 25, 50, 100];

/**
 * MemberManagement block – container component.
 * @param props - {@link MemberManagementProps}
 * @returns MemberManagement block
 */
function MemberManagement(props: MemberManagementProps) {
  const {
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    readOnly = false,
    onNavigateToMember,
    perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
  } = props;

  const membersList = useMembersList(customMessages);
  const invitationsList = useInvitationsList(customMessages);
  const isLoading = membersList.isLoading && invitationsList.isLoading;

  return (
    <GateKeeper isLoading={isLoading} styling={styling}>
      <MemberManagementView
        customMessages={customMessages}
        styling={styling}
        readOnly={readOnly}
        onNavigateToMember={onNavigateToMember}
        perPageOptions={perPageOptions}
        membersList={membersList}
        invitationsList={invitationsList}
      />
    </GateKeeper>
  );
}

/**
 * MemberManagement block – view component.
 * @internal
 */
function MemberManagementView({
  customMessages,
  styling,
  readOnly,
  perPageOptions,
  membersList,
  invitationsList,
}: MemberManagementProps & {
  membersList: ReturnType<typeof useMembersList>;
  invitationsList: ReturnType<typeof useInvitationsList>;
}) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management', customMessages);
  const { coreClient } = useCoreClient();

  const currentStyles = React.useMemo(
    () =>
      getComponentStyles(
        styling ?? { variables: { common: {}, light: {}, dark: {} }, classes: {} },
        isDarkMode,
      ),
    [styling, isDarkMode],
  );

  const {
    activeTab,
    setActiveTab,
    selectedMemberIds,
    setSelectedMemberIds,
    confirmModal,
    setConfirmModal,
    activeMemberId,
    setActiveMemberId,
  } = useMemberManagement();

  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);

  // Handle invite member
  const handleInvite = React.useCallback(
    async (email: string) => {
      if (!coreClient) return;
      try {
        const apiClient = coreClient.getMyOrganizationApiClient();
        await apiClient.organization.invitations.create({
          invitees: [{ email }],
        });
        showToast({ type: 'success', message: t('toasts.invite_success', { email }) });
        setInviteDialogOpen(false);
        invitationsList.refetch();
        membersList.refetch();
      } catch {
        showToast({ type: 'error', message: t('toasts.error_generic') });
      }
    },
    [coreClient, t, invitationsList, membersList],
  );

  // Handle confirmation modal actions
  const handleConfirm = React.useCallback(async () => {
    if (!confirmModal || !coreClient) return;
    setIsConfirming(true);

    try {
      const apiClient = coreClient.getMyOrganizationApiClient();

      switch (confirmModal.type) {
        case 'revokeResend': {
          await apiClient.organization.invitations.delete(confirmModal.invitationId);
          showToast({
            type: 'success',
            message: t('toasts.revoke_resend_success', { email: confirmModal.email }),
          });
          invitationsList.refetch();
          break;
        }
        case 'revokeInvitation': {
          await apiClient.organization.invitations.delete(confirmModal.invitationId);
          showToast({
            type: 'success',
            message: t('toasts.revoke_success', { email: confirmModal.email }),
          });
          invitationsList.refetch();
          break;
        }
        case 'deleteSingleMember': {
          await apiClient.organization.members.deleteMembers({
            members: [confirmModal.userId],
          });
          showToast({
            type: 'success',
            message: t('toasts.delete_success', { displayName: confirmModal.displayName }),
          });
          setSelectedMemberIds((prev) => prev.filter((id) => id !== confirmModal.userId));
          if (activeMemberId === confirmModal.userId) {
            setActiveMemberId(null);
          }
          membersList.refetch();
          break;
        }
        case 'bulkDeleteMembers': {
          await apiClient.organization.members.deleteMembers({
            members: confirmModal.userIds,
          });
          showToast({ type: 'success', message: t('toasts.bulk_delete_success') });
          setSelectedMemberIds([]);
          membersList.refetch();
          break;
        }
        case 'removeSingleMember': {
          await apiClient.organization.memberships.deleteMemberships({
            members: [confirmModal.userId],
          });
          showToast({
            type: 'success',
            message: t('toasts.remove_success', {
              displayName: confirmModal.displayName,
              orgName: confirmModal.orgName,
            }),
          });
          setSelectedMemberIds((prev) => prev.filter((id) => id !== confirmModal.userId));
          if (activeMemberId === confirmModal.userId) {
            setActiveMemberId(null);
          }
          membersList.refetch();
          break;
        }
        case 'bulkRemoveMembers': {
          await apiClient.organization.memberships.deleteMemberships({
            members: confirmModal.userIds,
          });
          showToast({
            type: 'success',
            message: t('toasts.bulk_remove_success', { orgName: confirmModal.orgName }),
          });
          setSelectedMemberIds([]);
          membersList.refetch();
          break;
        }
        case 'removeSingleRole': {
          await apiClient.organization.members.roles.delete(
            confirmModal.userId,
            confirmModal.roleId,
          );
          showToast({
            type: 'success',
            message: t('toasts.role_removed_success', { roleName: confirmModal.roleName }),
          });
          break;
        }
        case 'bulkRemoveRoles': {
          await Promise.all(
            confirmModal.roleIds.map((roleId) =>
              apiClient.organization.members.roles.delete(confirmModal.userId, roleId),
            ),
          );
          showToast({ type: 'success', message: t('toasts.bulk_roles_removed_success') });
          break;
        }
      }
    } catch {
      showToast({ type: 'error', message: t('toasts.error_generic') });
    } finally {
      setIsConfirming(false);
      setConfirmModal(null);
    }
  }, [
    confirmModal,
    coreClient,
    t,
    invitationsList,
    membersList,
    activeMemberId,
    setActiveMemberId,
    setSelectedMemberIds,
    setConfirmModal,
  ]);

  const handleViewMember = React.useCallback(
    (userId: string) => {
      setActiveMemberId(userId);
      if (onNavigateToMember) {
        onNavigateToMember(userId);
      }
    },
    [setActiveMemberId, onNavigateToMember],
  );

  // If a member is selected, show detail page
  if (activeMemberId) {
    return (
      <StyledScope style={currentStyles.variables}>
        <div className={cn('w-full', currentStyles.classes?.['MemberManagement-root'])}>
          <MemberDetail
            userId={activeMemberId}
            onBack={() => setActiveMemberId(null)}
            onConfirmModal={setConfirmModal}
            readOnly={readOnly}
            customMessages={customMessages}
            className={currentStyles.classes?.['MemberManagement-detail']}
          />

          {confirmModal && (
            <ConfirmationModal
              modal={confirmModal}
              onConfirm={handleConfirm}
              onCancel={() => setConfirmModal(null)}
              isConfirming={isConfirming}
              customMessages={customMessages}
            />
          )}
        </div>
      </StyledScope>
    );
  }

  return (
    <StyledScope style={currentStyles.variables}>
      <div className={cn('w-full', currentStyles.classes?.['MemberManagement-root'])}>
        <Header
          title={t('header.title')}
          description={t('header.description')}
          actions={
            readOnly
              ? []
              : [
                  {
                    type: 'button',
                    label: t('members_table.invite_button'),
                    onClick: () => setInviteDialogOpen(true),
                    icon: Plus,
                    disabled: false,
                  },
                ]
          }
        />

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as MemberManagementTab)}
          className={cn('mt-4', currentStyles.classes?.['MemberManagement-tabs'])}
        >
          <TabsList>
            <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
            <TabsTrigger value="invitations">{t('tabs.invitations')}</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-4">
            <MembersTab
              membersList={membersList}
              selectedMemberIds={selectedMemberIds}
              setSelectedMemberIds={setSelectedMemberIds}
              onViewMember={handleViewMember}
              onConfirmModal={setConfirmModal}
              readOnly={readOnly}
              customMessages={customMessages}
              perPageOptions={perPageOptions}
              className={currentStyles.classes?.['MemberManagement-table']}
            />
          </TabsContent>

          <TabsContent value="invitations" className="mt-4">
            <InvitationsTab
              invitationsList={invitationsList}
              onConfirmModal={setConfirmModal}
              readOnly={readOnly}
              customMessages={customMessages}
              perPageOptions={perPageOptions}
              className={currentStyles.classes?.['MemberManagement-table']}
            />
          </TabsContent>
        </Tabs>

        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          onSubmit={handleInvite}
          customMessages={customMessages}
        />

        {confirmModal && (
          <ConfirmationModal
            modal={confirmModal}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmModal(null)}
            isConfirming={isConfirming}
            customMessages={customMessages}
          />
        )}
      </div>
    </StyledScope>
  );
}

/**
 * Member management block.
 *
 * Two-tab interface for managing organization members and invitations.
 * Includes search, filter, bulk actions, role management, and member detail views.
 *
 * @param props - {@link MemberManagementProps}
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Render in read-only mode
 * @param props.onNavigateToMember - Callback when navigating to member detail
 * @param props.perPageOptions - Page size options for pagination
 * @returns Member management component
 *
 * @example
 * ```tsx
 * <MemberManagement
 *   onNavigateToMember={(userId) => navigate(`/members/${userId}`)}
 * />
 * ```
 */
export { MemberManagement, MemberManagementView };
