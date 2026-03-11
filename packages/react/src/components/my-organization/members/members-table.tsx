import type { OrganizationMember } from '../../../types/my-organization/members/members-list-types';
import { Badge } from '../../ui/badge';
import { Checkbox } from '../../ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0] ?? '';
      const last = parts[parts.length - 1] ?? '';
      return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return '??';
}

const MAX_VISIBLE_ROLES = 2;

export interface MembersTableProps {
  members: OrganizationMember[];
  selectedMembers: Set<string>;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onToggleMember: (memberId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMemberClick?: (member: OrganizationMember) => void;
  headerName: string;
  headerRoles: string;
  headerLastLogin: string;
  selectAllLabel: string;
  moreRolesLabel: (count: number) => string;
  formatLastLoginFn: (lastLogin?: string) => string;
}

export function MembersTable({
  members,
  selectedMembers,
  isAllSelected,
  isSomeSelected,
  onToggleMember,
  onSelectAll,
  onDeselectAll,
  onMemberClick,
  headerName,
  headerRoles,
  headerLastLogin,
  selectAllLabel,
  moreRolesLabel,
  formatLastLoginFn,
}: MembersTableProps) {
  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      onSelectAll();
    } else {
      onDeselectAll();
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
                onCheckedChange={handleSelectAllChange}
                aria-label={selectAllLabel}
              />
            </TableHead>
            <TableHead>{headerName}</TableHead>
            <TableHead>{headerRoles}</TableHead>
            <TableHead>{headerLastLogin}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isSelected = selectedMembers.has(member.user_id);
            const initials = getInitials(member.name, member.email);
            const visibleRoles = member.roles.slice(0, MAX_VISIBLE_ROLES);
            const hiddenRolesCount = member.roles.length - MAX_VISIBLE_ROLES;
            const lastLoginDisplay = formatLastLoginFn(member.last_login);

            return (
              <TableRow
                key={member.user_id}
                data-state={isSelected ? 'selected' : undefined}
                className={onMemberClick ? 'cursor-pointer' : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleMember(member.user_id)}
                    aria-label={`Select ${member.name ?? member.email ?? member.user_id}`}
                  />
                </TableCell>
                <TableCell onClick={() => onMemberClick?.(member)}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {member.picture ? (
                        <img
                          src={member.picture}
                          alt={member.name ?? member.email ?? ''}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      {member.name && <div className="font-medium text-sm">{member.name}</div>}
                      {member.email && (
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell onClick={() => onMemberClick?.(member)}>
                  <div className="flex flex-wrap gap-1">
                    {visibleRoles.map((role) => (
                      <Badge key={role.id} variant="outline" className="text-xs">
                        {role.name}
                      </Badge>
                    ))}
                    {hiddenRolesCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {moreRolesLabel(hiddenRolesCount)}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  className="text-sm text-muted-foreground"
                  onClick={() => onMemberClick?.(member)}
                >
                  {lastLoginDisplay}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
