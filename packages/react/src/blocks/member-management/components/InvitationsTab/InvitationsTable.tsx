import * as React from 'react';

import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationInvitation } from '../../MemberManagement.types';
import { InvitationRow } from './InvitationRow';

interface InvitationsTableProps {
  invitations: OrganizationInvitation[];
  isLoading: boolean;
  onCopyUrl: (invitation: OrganizationInvitation) => void;
  onRevokeAndResend: (invitation: OrganizationInvitation) => void;
  onRevoke: (invitation: OrganizationInvitation) => void;
}

export function InvitationsTable({
  invitations,
  isLoading,
  onCopyUrl,
  onRevokeAndResend,
  onRevoke,
}: InvitationsTableProps): React.JSX.Element {
  const cols = defaultMessages.invitations.columns;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" aria-label={defaultMessages.common.loading} />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
        <p className="font-medium">{defaultMessages.invitations.noInvitations}</p>
        <p className="text-sm text-muted-foreground">
          {defaultMessages.invitations.noInvitationsDescription}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow disableHover>
          <TableHead>{cols.email}</TableHead>
          <TableHead>{cols.status}</TableHead>
          <TableHead>{cols.createdAt}</TableHead>
          <TableHead>{cols.expiresAt}</TableHead>
          <TableHead>{cols.invitedBy}</TableHead>
          <TableHead className="w-10">
            <span className="sr-only">{cols.actions}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => (
          <InvitationRow
            key={invitation.id}
            invitation={invitation}
            onCopyUrl={onCopyUrl}
            onRevokeAndResend={onRevokeAndResend}
            onRevoke={onRevoke}
          />
        ))}
      </TableBody>
    </Table>
  );
}
