import { MoreHorizontalIcon } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationInvitation } from '../../MemberManagement.types';

interface InvitationContextMenuProps {
  invitation: OrganizationInvitation;
  onCopyUrl: (invitation: OrganizationInvitation) => void;
  onRevokeAndResend: (invitation: OrganizationInvitation) => void;
  onRevoke: (invitation: OrganizationInvitation) => void;
}

export function InvitationContextMenu({
  invitation,
  onCopyUrl,
  onRevokeAndResend,
  onRevoke,
}: InvitationContextMenuProps): React.JSX.Element {
  const msgs = defaultMessages.invitations.actions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        variant="ghost"
        size="icon"
        aria-label={`Actions for ${invitation.invitee.email}`}
      >
        <MoreHorizontalIcon className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {invitation.invitation_url && (
          <>
            <DropdownMenuItem onClick={() => onCopyUrl(invitation)}>
              {msgs.copyUrl}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => onRevokeAndResend(invitation)}>
          {msgs.revokeAndResend}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onRevoke(invitation)}
          className="text-destructive focus:text-destructive"
        >
          {msgs.revoke}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
