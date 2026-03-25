/**
 * Invitations tab – table with status, dates, and row actions.
 * @module invitations-tab
 */

import { ChevronLeft, ChevronRight, Copy, MoreHorizontal, Trash2 } from 'lucide-react';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  ConfirmModalState,
  MemberInvitation,
  MemberManagementMessages,
  UseInvitationsListReturn,
} from '@/types/my-organization/member-management';

export interface InvitationsTabProps {
  invitationsList: UseInvitationsListReturn;
  onConfirmModal: (modal: ConfirmModalState) => void;
  readOnly: boolean;
  customMessages?: Partial<MemberManagementMessages>;
  perPageOptions: number[];
  className?: string;
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
 * Checks whether an invitation has expired.
 * @param invitation - Invitation object.
 * @returns True if expired.
 */
function isExpired(invitation: MemberInvitation): boolean {
  if (!invitation.expires_at) return false;
  return new Date(invitation.expires_at) < new Date();
}

/**
 * Invitations tab content.
 * @param root0 - Component props.
 * @returns JSX element.
 */
export function InvitationsTab({
  invitationsList,
  onConfirmModal,
  readOnly,
  customMessages = {},
  perPageOptions,
  className,
}: InvitationsTabProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const {
    invitations,
    isLoading,
    page,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    perPage,
    setPerPage,
  } = invitationsList;

  const handleCopyUrl = React.useCallback(
    async (invitation: MemberInvitation) => {
      if (!invitation.invitation_url) return;
      await navigator.clipboard.writeText(invitation.invitation_url);
      showToast({
        type: 'success',
        message: t('invitations_table.actions.copied'),
      });
    },
    [t],
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
      {invitations.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          {t('invitations_table.empty_message')}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('invitations_table.columns.email')}</TableHead>
              <TableHead>{t('invitations_table.columns.status')}</TableHead>
              <TableHead>{t('invitations_table.columns.created_at')}</TableHead>
              <TableHead>{t('invitations_table.columns.expires_at')}</TableHead>
              <TableHead>{t('invitations_table.columns.invited_by')}</TableHead>
              {!readOnly && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => {
              const email = invitation.invitee?.email ?? '';
              const expired = isExpired(invitation);

              return (
                <TableRow key={invitation.id ?? email}>
                  <TableCell className="font-medium">{email}</TableCell>
                  <TableCell>
                    <Badge variant={expired ? 'warning' : 'info'}>
                      {expired
                        ? t('invitations_table.status.expired')
                        : t('invitations_table.status.pending')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(invitation.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(invitation.expires_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invitation.inviter?.name ?? '—'}
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={email}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invitation.invitation_url && (
                            <DropdownMenuItem onClick={() => handleCopyUrl(invitation)}>
                              <Copy className="mr-2 h-4 w-4" />
                              {t('invitations_table.actions.copy_invitation_url')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              onConfirmModal({
                                type: 'revokeResend',
                                invitationId: invitation.id ?? '',
                                email,
                              })
                            }
                          >
                            {t('invitations_table.actions.revoke_and_resend')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              onConfirmModal({
                                type: 'revokeInvitation',
                                invitationId: invitation.id ?? '',
                                email,
                              })
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('invitations_table.actions.revoke_invitation')}
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
