import { Search, X } from 'lucide-react';

import type {
  MemberRole,
  MembersFilter,
} from '../../../types/my-organization/members/members-list-types';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

export interface MembersToolbarProps {
  filters: MembersFilter;
  roles: MemberRole[];
  selectedCount: number;
  onSearch: (query: string) => void;
  onRoleFilter: (roleId: string | null) => void;
  onResetFilters: () => void;
  onDeselectAll: () => void;
  searchPlaceholder: string;
  roleAllLabel: string;
  resetLabel: string;
  membersSelectedLabel: string;
}

export function MembersToolbar({
  filters,
  roles,
  selectedCount,
  onSearch,
  onRoleFilter,
  onResetFilters,
  onDeselectAll,
  searchPlaceholder,
  roleAllLabel,
  resetLabel,
  membersSelectedLabel,
}: MembersToolbarProps) {
  const hasFilters = Boolean(filters.search || filters.roleId);

  return (
    <div className="space-y-2">
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <Badge variant="secondary">{membersSelectedLabel}</Badge>
          <Button variant="ghost" size="sm" onClick={onDeselectAll} aria-label="Clear selection">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder={searchPlaceholder}
            value={filters.search}
            onChange={(e) => onSearch(e.target.value)}
            aria-label={searchPlaceholder}
          />
        </div>
        {roles.length > 0 && (
          <Select
            value={filters.roleId ?? 'all'}
            onValueChange={(value) => onRoleFilter(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-[200px]" aria-label="Filter by role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{roleAllLabel}</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onResetFilters}>
            {resetLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
