import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationRole } from '../../MemberManagement.types';

interface RoleFilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  roles: OrganizationRole[];
  isLoading?: boolean;
  placeholder?: string;
  label?: string;
}

export function RoleFilterDropdown({
  value,
  onChange,
  roles,
  isLoading = false,
  placeholder,
  label,
}: RoleFilterDropdownProps): React.JSX.Element {
  const allRolesLabel = placeholder ?? defaultMessages.members.allRoles;

  return (
    <Select
      value={value || '__all__'}
      onValueChange={(v) => onChange(v === '__all__' ? '' : v)}
      disabled={isLoading}
    >
      <SelectTrigger
        className="h-9 w-[160px]"
        aria-label={label ?? defaultMessages.members.filterByRole}
      >
        <SelectValue placeholder={allRolesLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">{allRolesLabel}</SelectItem>
        {roles.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
