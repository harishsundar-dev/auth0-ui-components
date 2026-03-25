/**
 * Members tab – search, filter, table, bulk actions, and pagination.
 * @module members-tab
 */

import { ChevronLeft, ChevronRight, MoreHorizontal, Search, Shield, Trash2 } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  ConfirmModalState,
  MemberManagementMessages,
  OrgMember,
  UseMembersListReturn,
} from '@/types/my-organization/member-management';

export interface MembersTabProps {
  membersList: UseMembersListReturn;
  selectedMemberIds: string[];
  setSelectedMemberIds: React.Dispatch<React.SetStateAction<string[]>>;
  onViewMember: (userId: string) => void;
  onConfirmModal: (modal: ConfirmModalState) => void;
  readOnly: boolean;
  customMessages?: Partial<MemberManagementMessages>;
  perPageOptions: number[];
  className?: string;
}

/**
 * Derives a display name from a member record.
 * @param member - Organization member.
 * @returns Display name string.
 */
function getDisplayName(member: OrgMember): string {
  return member.name || member.email || member.nickname || member.user_id || '';
}

/**
 * Formats an ISO date string for display.
 * @param dateStr - ISO date string.
 * @returns Formatted date or dash.
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
}

/**
 * Members tab content.
 * @param root0 - Component props.
 * @returns JSX element.
 */
export function MembersTab({
  membersList,
  selectedMemberIds,
  setSelectedMemberIds,
  onViewMember,
  onConfirmModal,
  readOnly,
  customMessages = {},
  perPageOptions,
  className,
}: MembersTabProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const {
    members,
    isLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    perPage,
    setPerPage,
  } = membersList;

  // Collect unique role names for the filter
  const availableRoles = React.useMemo(() => {
    const roles = new Set<string>();
    members.forEach((m) => m.roles?.forEach((r) => roles.add(r.name)));
    return Array.from(roles).sort();
  }, [members]);

  const allSelected = members.length > 0 && selectedMemberIds.length === members.length;

  const toggleAll = React.useCallback(() => {
    if (allSelected) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(members.map((m) => m.user_id!).filter(Boolean));
    }
  }, [allSelected, members, setSelectedMemberIds]);

  const toggleMember = React.useCallback(
    (userId: string) => {
      setSelectedMemberIds((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
      );
    },
    [setSelectedMemberIds],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextField
            placeholder={t('members_table.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label={t('members_table.search_placeholder')}
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[200px]" aria-label={t('members_table.filter_by_role')}>
            <SelectValue placeholder={t('members_table.filter_by_role')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('members_table.filter_all')}</SelectItem>
            {availableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action toolbar */}
      {selectedMemberIds.length > 0 && !readOnly && (
        <div className="flex items-center gap-3 rounded-md border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">
            {t('members_table.bulk_selected', { count: String(selectedMemberIds.length) })}
          </span>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              onConfirmModal({ type: 'bulkDeleteMembers', userIds: selectedMemberIds })
            }
          >
            <Trash2 className="mr-1 h-4 w-4" />
            {t('members_table.actions.delete')}
          </Button>
        </div>
      )}

      {/* Table */}
      {members.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          {t('members_table.empty_message')}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {!readOnly && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label={t('members_table.columns.name')}
                  />
                </TableHead>
              )}
              <TableHead>{t('members_table.columns.name')}</TableHead>
              <TableHead>{t('members_table.columns.roles')}</TableHead>
              <TableHead>{t('members_table.columns.last_login')}</TableHead>
              {!readOnly && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const userId = member.user_id ?? '';
              const displayName = getDisplayName(member);
              const isSelected = selectedMemberIds.includes(userId);

              return (
                <TableRow key={userId} data-state={isSelected ? 'selected' : undefined}>
                  {!readOnly && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMember(userId)}
                        aria-label={displayName}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <button
                      type="button"
                      className="text-left font-medium hover:underline"
                      onClick={() => onViewMember(userId)}
                    >
                      {displayName}
                    </button>
                    {member.email && member.name && (
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.roles?.map((role) => (
                        <Badge key={role.id} variant="secondary">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.last_login)}
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={displayName}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewMember(userId)}>
                            {t('members_table.actions.view_details')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewMember(userId)}>
                            <Shield className="mr-2 h-4 w-4" />
                            {t('members_table.actions.assign_role')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              onConfirmModal({
                                type: 'deleteSingleMember',
                                userId,
                                displayName,
                              })
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('members_table.actions.remove_from_organization')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('pagination.rows_per_page')}</span>
          <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
            <SelectTrigger className="w-[70px]" aria-label={t('pagination.rows_per_page')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perPageOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousPage}
            disabled={!hasPreviousPage}
            aria-label={t('pagination.previous')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={!hasNextPage}
            aria-label={t('pagination.next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
