import { MoreHorizontal, Trash2, Send } from 'lucide-react';
import * as React from 'react';

import { useTranslator } from '../../../../hooks/use-translator';
import type { InvitationsTableActionsColumnProps } from '../../../../types/my-organization/invitations-management/invitations-table-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '../../../ui/dropdown-menu';

/**
 * InvitationsTableActionsColumn Component
 * Handles the actions column for Invitations table with dropdown menu
 */
export function InvitationsTableActionsColumn({
  customMessages = {},
  readOnly = false,
  invitation,
  onResend,
  onDelete,
  isResending,
}: InvitationsTableActionsColumnProps) {
  const { t } = useTranslator('invitations_management.invitations_table', customMessages);

  const handleResend = React.useCallback(() => {
    onResend(invitation);
  }, [invitation, onResend]);

  const handleDelete = React.useCallback(() => {
    onDelete(invitation);
  }, [invitation, onDelete]);

  // Determine if invitation is expired
  const isExpired = React.useMemo(() => {
    const expiresAt = new Date(invitation.expires_at);
    return expiresAt < new Date();
  }, [invitation.expires_at]);

  const isPending = !isExpired;

  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="end">
            {isPending && (
              <DropdownMenuItem onClick={handleResend} disabled={readOnly || isResending}>
                <Send className="mr-2 h-4 w-4" />
                {t('table.actions.resend_button_text')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive-foreground focus:text-destructive-foreground"
              disabled={readOnly}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive-foreground focus:text-destructive-foreground" />
              {t('table.actions.delete_button_text')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}
