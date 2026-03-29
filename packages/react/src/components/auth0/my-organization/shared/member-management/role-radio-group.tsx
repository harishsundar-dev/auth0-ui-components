/**
 * Role selector using a radio group.
 * @module role-radio-group
 * @internal
 */

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { OrganizationRole } from '@/types/my-organization/member-management/member-management-types';

interface RoleRadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  roles: OrganizationRole[];
  label: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Radio group role picker showing available organization roles.
 * @param props - Component props
 * @returns Role radio group element
 * @internal
 */
export function RoleRadioGroup({
  value,
  onChange,
  roles,
  label,
  error,
  disabled,
}: RoleRadioGroupProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled} aria-invalid={!!error}>
        {roles.map((role) => (
          <div key={role.id} className="flex items-center gap-2">
            <RadioGroupItem
              value={role.id}
              id={`invite-member-role-${role.id}`}
              disabled={disabled}
            />
            <div className="flex flex-col">
              <Label htmlFor={`invite-member-role-${role.id}`}>{role.name}</Label>
              {role.description && (
                <p className="text-muted-foreground text-xs">{role.description}</p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
      {error && (
        <p role="alert" className="text-destructive-foreground text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
