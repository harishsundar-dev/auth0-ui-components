import {
  type Invitation,
  getComponentStyles,
  MY_ORGANIZATION_INVITATIONS_TABLE_SCOPES,
} from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { InvitationCreateModal } from '../../../components/my-organization/invitations-management/invitation-create/invitation-create-modal';
import { InvitationDeleteModal } from '../../../components/my-organization/invitations-management/invitation-delete/invitation-delete-modal';
import { InvitationsTableActionsColumn } from '../../../components/my-organization/invitations-management/invitations-table/invitations-table-actions-column';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { DataTable, type Column } from '../../../components/ui/data-table';
import { Header } from '../../../components/ui/header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { withMyOrganizationService } from '../../../hoc/with-services';
import { useInvitationsTable } from '../../../hooks/my-organization/invitations-management/use-invitations-table';
import { useInvitationsTableLogic } from '../../../hooks/my-organization/invitations-management/use-invitations-table-logic';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import type { InvitationsTableProps } from '../../../types/my-organization/invitations-management/invitations-table-types';

/**
 * Helper to determine invitation status
 */
function getInvitationStatus(invitation: Invitation): 'pending' | 'expired' {
  const expiresAt = new Date(invitation.expires_at);
  return expiresAt < new Date() ? 'expired' : 'pending';
}

/**
 * Helper to get status badge variant
 */
function getStatusBadgeVariant(status: 'pending' | 'expired'): 'default' | 'secondary' {
  return status === 'pending' ? 'default' : 'secondary';
}

/**
 * Helper to format date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * InvitationsTable Component
 */
function InvitationsTableComponent({
  customMessages = {},
  schema,
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  hideHeader = false,
  readOnly = false,
  createAction,
  resendAction,
  deleteAction,
  onTabChange,
  defaultTab = 'invitations',
  pageSize = 10,
}: InvitationsTableProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('invitations_management.invitations_table', customMessages);
  const statusT = useTranslator('invitations_management.shared.status', customMessages);

  const {
    invitations,
    roles,
    // totalInvitations,
    // currentPage,
    isFetchingInvitations,
    // isFetchingRoles,
    isCreating,
    isDeleting,
    isResending,
    selectedRoleFilter,
    setSelectedRoleFilter,
    // setCurrentPage,
    fetchInvitations,
    onCreateInvitation,
    onResendInvitation,
    onDeleteInvitation,
  } = useInvitationsTable({
    createAction,
    resendAction,
    deleteAction,
    customMessages,
    pageSize,
  });

  const {
    activeTab,
    setActiveTab,
    showCreateModal,
    showDeleteModal,
    selectedInvitation,
    setShowCreateModal,
    setShowDeleteModal,
    handleCreate,
    // handleResend,
    handleDelete,
    handleCreateClick,
    handleResendClick,
    handleDeleteClick,
  } = useInvitationsTableLogic({
    t,
    onCreateInvitation,
    onResendInvitation,
    onDeleteInvitation,
    fetchInvitations,
    onTabChange,
    defaultTab,
  });

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  // Filter invitations by selected role
  const filteredInvitations = React.useMemo(() => {
    if (!selectedRoleFilter) return invitations;
    return invitations.filter((inv) => inv.roles?.includes(selectedRoleFilter));
  }, [invitations, selectedRoleFilter]);

  const columns: Column<Invitation>[] = React.useMemo(
    () =>
      [
        {
          type: 'text',
          accessorKey: 'id',
          title: t('table.columns.email'),
          width: '25%',
          render: (invitation: Invitation) => (
            <div className="font-medium">{invitation.invitee.email}</div>
          ),
        },
        {
          type: 'text',
          accessorKey: 'id',
          title: t('table.columns.status'),
          width: '15%',
          render: (invitation: Invitation) => {
            const status = getInvitationStatus(invitation);
            return (
              <Badge variant={getStatusBadgeVariant(status)} size="sm">
                {statusT.t(status)}
              </Badge>
            );
          },
        },
        {
          type: 'text',
          accessorKey: 'created_at',
          title: t('table.columns.created_at'),
          width: '15%',
          render: (invitation: Invitation) => (
            <div className="text-sm text-muted-foreground">{formatDate(invitation.created_at)}</div>
          ),
        },
        {
          type: 'text',
          accessorKey: 'expires_at',
          title: t('table.columns.expires_at'),
          width: '15%',
          render: (invitation: Invitation) => (
            <div className="text-sm text-muted-foreground">{formatDate(invitation.expires_at)}</div>
          ),
        },
        {
          type: 'text',
          accessorKey: 'id',
          title: t('table.columns.invited_by'),
          width: '15%',
          render: (invitation: Invitation) => (
            <div className="text-sm">{invitation.inviter.name}</div>
          ),
        },
        {
          type: 'actions',
          title: '',
          width: '15%',
          render: (invitation: Invitation) => (
            <InvitationsTableActionsColumn
              invitation={invitation}
              readOnly={readOnly}
              customMessages={customMessages}
              onResend={handleResendClick}
              onDelete={handleDeleteClick}
              isResending={isResending}
            />
          ),
        },
      ] as Column<Invitation>[],
    [t, statusT, readOnly, customMessages, handleResendClick, handleDeleteClick, isResending],
  );

  return (
    <div style={currentStyles.variables}>
      {!hideHeader && (
        <div className={currentStyles.classes?.['InvitationsTable-header']}>
          <Header
            title={t('header.title')}
            description={t('header.description')}
            actions={[
              {
                type: 'button',
                label: t('header.create_button_text'),
                onClick: handleCreateClick,
                icon: Plus,
                disabled: readOnly || isFetchingInvitations,
              },
            ]}
          />
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'members' | 'invitations')}
        className={currentStyles.classes?.['InvitationsTable-tabs']}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
          <TabsTrigger value="invitations">{t('tabs.invitations')}</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <p>Member table will be shown here when integrated with MemberTable block</p>
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          {/* Filters */}
          <div
            className={`flex items-center gap-4 mb-6 ${currentStyles.classes?.['InvitationsTable-filters']}`}
          >
            <div className="flex items-center gap-2">
              <label htmlFor="role-filter" className="text-sm font-medium">
                {t('filter.role_label')}
              </label>
              <Select
                value={selectedRoleFilter ?? 'all'}
                onValueChange={(value) => setSelectedRoleFilter(value === 'all' ? null : value)}
              >
                <SelectTrigger id="role-filter" className="w-[200px]">
                  <SelectValue placeholder={t('filter.role_all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter.role_all')}</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRoleFilter && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedRoleFilter(null)}>
                {t('filter.reset')}
              </Button>
            )}
          </div>

          <DataTable
            columns={columns}
            data={filteredInvitations}
            loading={isFetchingInvitations}
            emptyState={{ title: t('table.empty_message') }}
            className={currentStyles.classes?.['InvitationsTable-table']}
          />
        </TabsContent>
      </Tabs>

      <InvitationCreateModal
        className={currentStyles.classes?.['InvitationsTable-createModal']}
        isOpen={showCreateModal}
        isLoading={isCreating}
        roles={roles}
        schema={schema?.create as any}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        customMessages={customMessages.create}
      />

      <InvitationDeleteModal
        className={currentStyles.classes?.['InvitationsTable-deleteModal']}
        invitation={selectedInvitation}
        isOpen={showDeleteModal}
        isLoading={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        customMessages={customMessages.delete}
      />
    </div>
  );
}

export const InvitationsTable = withMyOrganizationService(
  InvitationsTableComponent,
  MY_ORGANIZATION_INVITATIONS_TABLE_SCOPES,
);
