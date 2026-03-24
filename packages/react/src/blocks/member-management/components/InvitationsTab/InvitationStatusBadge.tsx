import * as React from 'react';

import { Badge } from '@/components/ui/badge';

import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationInvitation } from '../../MemberManagement.types';

interface InvitationStatusBadgeProps {
  invitation: OrganizationInvitation;
}

export function InvitationStatusBadge({
  invitation,
}: InvitationStatusBadgeProps): React.JSX.Element {
  const msgs = defaultMessages.invitations.status;

  const status = invitation.status ?? deriveStatus(invitation);

  const variantMap = {
    pending: 'warning',
    expired: 'destructive',
    accepted: 'success',
  } as const;

  const labelMap = {
    pending: msgs.pending,
    expired: msgs.expired,
    accepted: msgs.accepted,
  };

  return (
    <Badge variant={variantMap[status] ?? 'secondary'} size="sm">
      {labelMap[status] ?? status}
    </Badge>
  );
}

function deriveStatus(invitation: OrganizationInvitation): 'pending' | 'expired' | 'accepted' {
  if (!invitation.ticket_expiration_at) return 'pending';
  return new Date(invitation.ticket_expiration_at) < new Date() ? 'expired' : 'pending';
}
