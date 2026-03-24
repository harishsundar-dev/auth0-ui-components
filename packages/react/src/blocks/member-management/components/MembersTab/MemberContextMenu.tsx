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
import type { OrganizationMember } from '../../MemberManagement.types';

interface MemberContextMenuProps {
  member: OrganizationMember;
  onViewDetails: (member: OrganizationMember) => void;
  onAssignRole: (member: OrganizationMember) => void;
  onRemoveFromOrg: (member: OrganizationMember) => void;
  onDeleteMember: (member: OrganizationMember) => void;
}

export function MemberContextMenu({
  member,
  onViewDetails,
  onAssignRole,
  onRemoveFromOrg,
  onDeleteMember,
}: MemberContextMenuProps): React.JSX.Element {
  const msgs = defaultMessages.members.actions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        variant="ghost"
        size="icon"
        aria-label={`Actions for ${member.name ?? member.email ?? member.user_id}`}
      >
        <MoreHorizontalIcon className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(member)}>
          {msgs.viewDetails}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAssignRole(member)}>
          {msgs.assignRole}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onRemoveFromOrg(member)}>
          {msgs.removeFromOrg}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDeleteMember(member)}
          className="text-destructive focus:text-destructive"
        >
          {msgs.deleteMember}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
