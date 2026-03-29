/**
 * Role selector using a combobox/select dropdown.
 * @module role-select-field
 * @internal
 */

import * as React from 'react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OrganizationRole } from '@/types/my-organization/member-management/member-management-types';

interface RoleSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  roles: OrganizationRole[];
  label: string;
  placeholder: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Combobox/select role picker showing available organization roles.
 * @param props - Component props
 * @returns Role select field element
 * @internal
 */
export function RoleSelectField({
  value,
  onChange,
  roles,
  label,
  placeholder,
  error,
  disabled,
}: RoleSelectFieldProps): React.JSX.Element {
  const selectId = 'invite-member-role';

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={selectId}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={`${selectId}-error`} role="alert" className="text-destructive-foreground text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
