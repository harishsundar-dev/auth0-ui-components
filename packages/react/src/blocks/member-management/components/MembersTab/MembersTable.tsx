import * as React from 'react';

import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationMember } from '../../MemberManagement.types';

import { MemberRow } from './MemberRow';

import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';



interface MembersTableProps {
  members: OrganizationMember[];
  isLoading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onViewDetails: (member: OrganizationMember) => void;
  onAssignRole: (member: OrganizationMember) => void;
  onRemoveFromOrg: (member: OrganizationMember) => void;
  onDeleteMember: (member: OrganizationMember) => void;
}

/**
 *
 * @param root0
 */
export function MembersTable({
  members,
  isLoading,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  isAllSelected,
  isIndeterminate,
  onViewDetails,
  onAssignRole,
  onRemoveFromOrg,
  onDeleteMember,
}: MembersTableProps): React.JSX.Element {
  const cols = defaultMessages.members.columns;

  const handleHeaderCheckboxChange = () => {
    if (isAllSelected) {
      onClearSelection();
    } else {
      onSelectAll(members.map((m) => m.user_id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" aria-label={defaultMessages.common.loading} />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
        <p className="font-medium">{defaultMessages.members.noMembers}</p>
        <p className="text-sm text-muted-foreground">
          {defaultMessages.members.noMembersDescription}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow disableHover>
          <TableHead className="w-10">
            <Checkbox
              checked={isIndeterminate ? 'indeterminate' : isAllSelected}
              onCheckedChange={handleHeaderCheckboxChange}
              aria-label="Select all members"
            />
          </TableHead>
          <TableHead>{cols.name}</TableHead>
          <TableHead>{cols.roles}</TableHead>
          <TableHead>{cols.lastLogin}</TableHead>
          <TableHead className="w-10">
            <span className="sr-only">{cols.actions}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <MemberRow
            key={member.user_id}
            member={member}
            isSelected={selectedIds.includes(member.user_id)}
            onToggleSelect={onToggleSelect}
            onViewDetails={onViewDetails}
            onAssignRole={onAssignRole}
            onRemoveFromOrg={onRemoveFromOrg}
            onDeleteMember={onDeleteMember}
          />
        ))}
      </TableBody>
    </Table>
  );
}
