import * as React from 'react';

import { Button } from '@/components/ui/button';

import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationRole } from '../../MemberManagement.types';

interface RoleListItemProps {
  role: OrganizationRole;
  onRemove: (role: OrganizationRole) => void;
}

export function RoleListItem({ role, onRemove }: RoleListItemProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium">{role.name}</span>
        {role.description && (
          <span className="text-xs text-muted-foreground truncate">{role.description}</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(role)}
        aria-label={`${defaultMessages.memberDetail.roles.removeRole} ${role.name}`}
        className="text-destructive hover:text-destructive shrink-0"
      >
        {defaultMessages.memberDetail.roles.removeRole}
      </Button>
    </div>
  );
}
