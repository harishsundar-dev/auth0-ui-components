import {
  getComponentStyles,
  MY_ORGANIZATION_MEMBERS_LIST_SCOPES,
} from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { MembersEmptyState } from '../../../components/my-organization/members/members-empty-state';
import { MembersPagination } from '../../../components/my-organization/members/members-pagination';
import { MembersTable } from '../../../components/my-organization/members/members-table';
import { MembersToolbar } from '../../../components/my-organization/members/members-toolbar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Header } from '../../../components/ui/header';
import { Spinner } from '../../../components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { withMyOrganizationService } from '../../../hoc/with-services';
import { useMembersList } from '../../../hooks/my-organization/members/use-members-list';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import type { MembersListProps } from '../../../types/my-organization/members/members-list-types';

/**
 * MembersList Block Component
 *
 * Provides a comprehensive member management interface for an Auth0 organization,
 * including a paginated, searchable table of members with multi-select support
 * for bulk operations, role filtering, and tab navigation between members and invitations.
 *
 * @example
 * ```tsx
 * <MembersList
 *   onBack={() => router.push('/organizations')}
 *   onInviteMember={() => setShowInviteModal(true)}
 *   onMembersRemoved={(ids) => console.log('Removed:', ids)}
 * />
 * ```
 */
function MembersListComponent({
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly = false,
  hideHeader = false,
  onBack,
  onInviteMember,
  onMemberClick,
  onMembersRemoved,
  defaultPageSize = 10,
  showInvitationsTab = true,
}: MembersListProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.members_list', customMessages);
  const { isDarkMode } = useTheme();

  const { members, roles, isLoading, pagination, filters, selectedMembers, actions, computed } =
    useMembersList({ defaultPageSize });

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  if (isLoading && members.length === 0) {
    return (
      <div
        style={currentStyles.variables}
        className="flex items-center justify-center min-h-96 w-full"
      >
        <Spinner />
      </div>
    );
  }

  const handleRemoveSelected = async () => {
    const selectedIds = [...selectedMembers];
    await actions.removeMembers(selectedIds);
    onMembersRemoved?.(selectedIds);
  };

  const membersSelectedLabel =
    computed.selectedCount === 1
      ? t('selection.member_selected')
      : t('selection.members_selected', { count: computed.selectedCount });

  const showingLabel = (start: number, end: number, total: number) =>
    t('pagination.showing', { start, end, total });

  const moreRolesLabel = (count: number) => t('roles.more_roles', { count });

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return t('last_login.never');

    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffMs = now.getTime() - loginDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMinutes < 1) return t('last_login.just_now');
    if (diffHours < 1) return t('last_login.minutes_ago', { count: diffMinutes });
    if (diffDays < 1) return t('last_login.hours_ago', { count: diffHours });
    if (diffWeeks < 1) return t('last_login.days_ago', { count: diffDays });
    if (diffMonths < 1) return t('last_login.weeks_ago', { count: diffWeeks });
    if (diffYears < 1) return t('last_login.months_ago', { count: diffMonths });
    return t('last_login.years_ago', { count: diffYears });
  };

  const membersTabContent = (
    <div className="space-y-4 mt-4">
      <MembersToolbar
        filters={filters}
        roles={roles}
        selectedCount={computed.selectedCount}
        onSearch={actions.setSearch}
        onRoleFilter={actions.setRoleFilter}
        onResetFilters={actions.resetFilters}
        onDeselectAll={actions.deselectAll}
        searchPlaceholder={t('search.placeholder')}
        roleAllLabel={t('filter.role_all')}
        resetLabel={t('filter.reset')}
        membersSelectedLabel={membersSelectedLabel}
      />

      {computed.selectedCount > 0 && !readOnly && (
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={handleRemoveSelected}>
            {t('actions.remove_selected')}
          </Button>
        </div>
      )}

      {members.length === 0 && !isLoading ? (
        <MembersEmptyState title={t('empty.title')} description={t('empty.description')} />
      ) : (
        <>
          <MembersTable
            members={members}
            selectedMembers={selectedMembers}
            isAllSelected={computed.isAllSelected}
            isSomeSelected={computed.isSomeSelected}
            onToggleMember={actions.toggleMember}
            onSelectAll={actions.selectAll}
            onDeselectAll={actions.deselectAll}
            onMemberClick={onMemberClick}
            headerName={t('table.header_name')}
            headerRoles={t('table.header_roles')}
            headerLastLogin={t('table.header_last_login')}
            selectAllLabel={t('table.select_all')}
            moreRolesLabel={moreRolesLabel}
            formatLastLoginFn={formatLastLogin}
          />
          <MembersPagination
            pagination={pagination}
            onPageChange={actions.setPage}
            onPageSizeChange={actions.setPageSize}
            showingLabel={showingLabel}
            perPageLabel={t('pagination.per_page')}
          />
        </>
      )}
    </div>
  );

  return (
    <div style={currentStyles.variables} className="w-full">
      {!hideHeader && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Header
              title={t('title')}
              description={t('description')}
              backButton={
                onBack
                  ? {
                      text: t('back'),
                      onClick: () => onBack(),
                    }
                  : undefined
              }
              actions={
                !readOnly
                  ? [
                      {
                        type: 'button',
                        label: t('invite_member'),
                        icon: Plus,
                        onClick: () => onInviteMember?.(),
                      },
                    ]
                  : []
              }
            />
            <Badge variant="secondary" className="shrink-0">
              {pagination.total}
            </Badge>
          </div>
        </div>
      )}

      {showInvitationsTab ? (
        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
            <TabsTrigger value="invitations">{t('tabs.invitations')}</TabsTrigger>
          </TabsList>

          <TabsContent value="members">{membersTabContent}</TabsContent>

          <TabsContent value="invitations" className="mt-4">
            <div className="text-sm text-muted-foreground py-8 text-center">
              {t('tabs.invitations')}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        membersTabContent
      )}
    </div>
  );
}

export const MembersList = withMyOrganizationService(
  MembersListComponent,
  MY_ORGANIZATION_MEMBERS_LIST_SCOPES,
);
