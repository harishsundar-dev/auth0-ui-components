import { PlusIcon } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';


import { useMemberManagement } from '../../context/MemberManagementContext';
import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationRole } from '../../MemberManagement.types';
import { AssignRolesDialog } from '../dialogs/AssignRolesDialog';
import { ConfirmationDialog } from '../dialogs/ConfirmationDialog';

import { RoleListItem } from './RoleListItem';

import { Button } from '@/components/ui/button';

interface MemberRolesTabProps {
  userId: string;
  roles: OrganizationRole[];
  availableRoles: OrganizationRole[];
  onRolesChanged: () => void;
}

/**
 *
 * @param root0
 */
export function MemberRolesTab({
  userId,
  roles,
  availableRoles,
  onRolesChanged,
}: MemberRolesTabProps): React.JSX.Element {
  const { client, pushToast } = useMemberManagement();
  const msgs = defaultMessages.memberDetail.roles;

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [removeRoleConfirm, setRemoveRoleConfirm] = useState<{
    role: OrganizationRole;
    isLoading: boolean;
    error: string | null;
  } | null>(null);

  const handleRemoveRole = (role: OrganizationRole) => {
    setRemoveRoleConfirm({ role, isLoading: false, error: null });
  };

  const confirmRemoveRole = async () => {
    if (!removeRoleConfirm) return;
    setRemoveRoleConfirm((prev) => prev && { ...prev, isLoading: true, error: null });
    try {
      await client.organization.members.roles.delete(userId, removeRoleConfirm.role.id);
      pushToast(`Role "${removeRoleConfirm.role.name}" removed`, 'success');
      setRemoveRoleConfirm(null);
      onRolesChanged();
    } catch {
      setRemoveRoleConfirm((prev) =>
        prev && { ...prev, isLoading: false, error: defaultMessages.common.error },
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{msgs.title}</h3>
        <Button variant="outline" size="sm" onClick={() => setIsAssignOpen(true)}>
          <PlusIcon className="size-4" aria-hidden="true" />
          {msgs.assignRole}
        </Button>
      </div>

      {roles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="font-medium text-sm">{msgs.noRoles}</p>
          <p className="text-xs text-muted-foreground">{msgs.noRolesDescription}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {roles.map((role) => (
            <RoleListItem key={role.id} role={role} onRemove={handleRemoveRole} />
          ))}
        </div>
      )}

      <AssignRolesDialog
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        userId={userId}
        client={client}
        availableRoles={availableRoles}
        assignedRoleIds={roles.map((r) => r.id)}
        onSuccess={(msg) => {
          pushToast(msg, 'success');
          onRolesChanged();
        }}
        onError={(msg) => pushToast(msg, 'error')}
      />

      {removeRoleConfirm && (
        <ConfirmationDialog
          isOpen={!!removeRoleConfirm}
          title={defaultMessages.dialogs.confirmRemoveRole.title}
          description={defaultMessages.dialogs.confirmRemoveRole.description.replace(
            '{roleName}',
            removeRoleConfirm.role.name,
          )}
          confirmLabel={defaultMessages.dialogs.confirmRemoveRole.confirm}
          cancelLabel={defaultMessages.dialogs.confirmRemoveRole.cancel}
          isLoading={removeRoleConfirm.isLoading}
          error={removeRoleConfirm.error}
          onConfirm={() => void confirmRemoveRole()}
          onCancel={() => setRemoveRoleConfirm(null)}
        />
      )}
    </div>
  );
}
