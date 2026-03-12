'use client';

import {
  getComponentStyles,
  MY_ORGANIZATION_MEMBERS_MANAGER_SCOPES,
} from '@auth0/universal-components-core';
import { UserPlus } from 'lucide-react';
import * as React from 'react';

import {
  DeleteInvitationDialog,
  InviteMemberDialog,
  InvitationsTable,
  MembersTable,
  RemoveMemberDialog,
  UpdateRolesDialog,
} from '../../../components/my-organization/members-management/organization-members-manager-components';
import { Header } from '../../../components/ui/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { withMyOrganizationService } from '../../../hoc/with-services';
import { useInviteMember } from '../../../hooks/my-organization/members-management/use-invite-member';
import { useOrganizationInvitations } from '../../../hooks/my-organization/members-management/use-organization-invitations';
import { useOrganizationMembers } from '../../../hooks/my-organization/members-management/use-organization-members';
import { useOrganizationRoles } from '../../../hooks/my-organization/members-management/use-organization-roles';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import type {
  OrganizationMember,
  OrganizationMembersManagerProps,
} from '../../../types/my-organization/members-management/organization-members-manager-types';

/**
 * OrganizationMembersManager Component
 */
function OrganizationMembersManagerComponent({
  customMessages = {},
  readOnly = false,
  initialTab = 'members',
  onMemberInvited,
  onMemberRemoved,
}: OrganizationMembersManagerProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('members_management.organization_members_manager', customMessages);

  const currentStyles = React.useMemo(
    () =>
      getComponentStyles(
        { variables: { common: {}, light: {}, dark: {} }, classes: {} },
        isDarkMode,
      ),
    [isDarkMode],
  );

  const {
    members,
    isLoading: isMembersLoading,
    searchQuery,
    search,
    removeMember,
    isRemoving,
  } = useOrganizationMembers({ customMessages });

  const {
    invitations,
    isLoading: isInvitationsLoading,
    deleteInvitation,
    isDeleting,
  } = useOrganizationInvitations({ customMessages });

  const { roles } = useOrganizationRoles();

  const { inviteSingle, isInviting } = useInviteMember({
    onSuccess: onMemberInvited,
    customMessages,
  });

  const [showInviteDialog, setShowInviteDialog] = React.useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = React.useState(false);
  const [showDeleteInvitationDialog, setShowDeleteInvitationDialog] = React.useState(false);
  const [showUpdateRolesDialog, setShowUpdateRolesDialog] = React.useState(false);

  const [selectedMember, setSelectedMember] = React.useState<OrganizationMember | null>(null);
  const [selectedInvitationId, setSelectedInvitationId] = React.useState('');
  const [selectedInvitationEmail, setSelectedInvitationEmail] = React.useState('');
  const [pendingRoleIds, setPendingRoleIds] = React.useState<string[]>([]);

  const handleRemoveClick = (member: OrganizationMember) => {
    setSelectedMember(member);
    setShowRemoveDialog(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedMember) return;
    await removeMember(selectedMember.userId, selectedMember.name);
    onMemberRemoved?.(selectedMember.userId);
    setShowRemoveDialog(false);
    setSelectedMember(null);
  };

  const handleDeleteInvitationClick = (invitationId: string, email: string) => {
    setSelectedInvitationId(invitationId);
    setSelectedInvitationEmail(email);
    setShowDeleteInvitationDialog(true);
  };

  const handleDeleteInvitationConfirm = async () => {
    await deleteInvitation(selectedInvitationId, selectedInvitationEmail);
    setShowDeleteInvitationDialog(false);
    setSelectedInvitationId('');
    setSelectedInvitationEmail('');
  };

  const handleUpdateRolesClick = (member: OrganizationMember) => {
    setSelectedMember(member);
    setPendingRoleIds(member.roles.map((r) => r.id));
    setShowUpdateRolesDialog(true);
  };

  const handleRoleToggle = (roleId: string) => {
    setPendingRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const handleUpdateRolesConfirm = async () => {
    setShowUpdateRolesDialog(false);
    setSelectedMember(null);
    setPendingRoleIds([]);
  };

  const handleInviteSingle = async (email: string, roleIds: string[]) => {
    const result = await inviteSingle({ email, roleIds });
    if (result) {
      setShowInviteDialog(false);
    }
  };

  return (
    <div style={currentStyles.variables}>
      <Header
        title={t('header.title')}
        actions={
          !readOnly
            ? [
                {
                  type: 'button',
                  label: t('header.invite_button_text'),
                  onClick: () => setShowInviteDialog(true),
                  icon: UserPlus,
                  disabled: isInviting,
                },
              ]
            : []
        }
      />

      <Tabs defaultValue={initialTab} className="mt-4">
        <TabsList>
          <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
          <TabsTrigger value="invitations">{t('tabs.invitations')}</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersTable
            members={members}
            isLoading={isMembersLoading}
            searchQuery={searchQuery}
            onSearch={search}
            onUpdateRoles={handleUpdateRolesClick}
            onRemove={handleRemoveClick}
            readOnly={readOnly}
            t={t}
          />
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationsTable
            invitations={invitations}
            isLoading={isInvitationsLoading}
            onDelete={handleDeleteInvitationClick}
            readOnly={readOnly}
            t={t}
          />
        </TabsContent>
      </Tabs>

      <InviteMemberDialog
        isOpen={showInviteDialog}
        availableRoles={roles}
        isLoading={isInviting}
        onClose={() => setShowInviteDialog(false)}
        onInviteSingle={handleInviteSingle}
        t={t}
      />

      <RemoveMemberDialog
        isOpen={showRemoveDialog}
        member={selectedMember}
        isLoading={isRemoving}
        onClose={() => {
          setShowRemoveDialog(false);
          setSelectedMember(null);
        }}
        onConfirm={handleRemoveConfirm}
        t={t}
      />

      <UpdateRolesDialog
        isOpen={showUpdateRolesDialog}
        member={selectedMember}
        availableRoles={roles}
        selectedRoleIds={pendingRoleIds}
        isLoading={false}
        onClose={() => {
          setShowUpdateRolesDialog(false);
          setSelectedMember(null);
          setPendingRoleIds([]);
        }}
        onRoleToggle={handleRoleToggle}
        onConfirm={handleUpdateRolesConfirm}
        t={t}
      />

      <DeleteInvitationDialog
        isOpen={showDeleteInvitationDialog}
        email={selectedInvitationEmail}
        isLoading={isDeleting}
        onClose={() => {
          setShowDeleteInvitationDialog(false);
          setSelectedInvitationId('');
          setSelectedInvitationEmail('');
        }}
        onConfirm={handleDeleteInvitationConfirm}
        t={t}
      />
    </div>
  );
}

export const OrganizationMembersManager = withMyOrganizationService(
  OrganizationMembersManagerComponent,
  MY_ORGANIZATION_MEMBERS_MANAGER_SCOPES,
);
