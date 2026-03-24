import * as React from 'react';


import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationInvitation } from '../../MemberManagement.types';

import { InvitationContextMenu } from './InvitationContextMenu';
import { InvitationStatusBadge } from './InvitationStatusBadge';

import { TableCell, TableRow } from '@/components/ui/table';

interface InvitationRowProps {
  invitation: OrganizationInvitation;
  onCopyUrl: (invitation: OrganizationInvitation) => void;
  onRevokeAndResend: (invitation: OrganizationInvitation) => void;
  onRevoke: (invitation: OrganizationInvitation) => void;
}

/**
 *
 * @param dateStr
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return defaultMessages.common.never;
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return defaultMessages.common.unknown;
  }
}

/**
 *
 * @param root0
 */
export function InvitationRow({
  invitation,
  onCopyUrl,
  onRevokeAndResend,
  onRevoke,
}: InvitationRowProps): React.JSX.Element {
  return (
    <TableRow>
      <TableCell>
        <span className="text-sm font-medium">{invitation.invitee.email}</span>
      </TableCell>
      <TableCell>
        <InvitationStatusBadge invitation={invitation} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(invitation.created_at)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(invitation.ticket_expiration_at)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{invitation.inviter.name}</TableCell>
      <TableCell className="w-10 text-right">
        <InvitationContextMenu
          invitation={invitation}
          onCopyUrl={onCopyUrl}
          onRevokeAndResend={onRevokeAndResend}
          onRevoke={onRevoke}
        />
      </TableCell>
    </TableRow>
  );
}
