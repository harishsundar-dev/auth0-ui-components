import * as React from 'react';

import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationMember } from '../../MemberManagement.types';

import { MemberContextMenu } from './MemberContextMenu';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';



interface MemberRowProps {
  member: OrganizationMember;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onViewDetails: (member: OrganizationMember) => void;
  onAssignRole: (member: OrganizationMember) => void;
  onRemoveFromOrg: (member: OrganizationMember) => void;
  onDeleteMember: (member: OrganizationMember) => void;
}

/**
 *
 * @param dateStr
 */
function formatLastLogin(dateStr?: string): string {
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
export function MemberRow({
  member,
  isSelected,
  onToggleSelect,
  onViewDetails,
  onAssignRole,
  onRemoveFromOrg,
  onDeleteMember,
}: MemberRowProps): React.JSX.Element {
  const displayName = member.name ?? member.email ?? member.user_id;

  return (
    <TableRow>
      <TableCell className="w-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(member.user_id)}
          aria-label={`Select ${displayName}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          {member.picture && (
            <img
              src={member.picture}
              alt=""
              className="size-8 rounded-full object-cover shrink-0"
              aria-hidden="true"
            />
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm truncate">{displayName}</span>
            {member.name && member.email && (
              <span className="text-xs text-muted-foreground truncate">{member.email}</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {member.roles?.map((role) => (
            <Badge key={role.id} variant="secondary" size="sm">
              {role.name}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatLastLogin(member.last_login)}
      </TableCell>
      <TableCell className="w-10 text-right">
        <MemberContextMenu
          member={member}
          onViewDetails={onViewDetails}
          onAssignRole={onAssignRole}
          onRemoveFromOrg={onRemoveFromOrg}
          onDeleteMember={onDeleteMember}
        />
      </TableCell>
    </TableRow>
  );
}
