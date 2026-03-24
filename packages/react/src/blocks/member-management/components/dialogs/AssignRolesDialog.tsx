import * as React from 'react';
import { useState } from 'react';

import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationRole, OrganizationSDKClient } from '../../MemberManagement.types';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';


interface AssignRolesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  client: OrganizationSDKClient;
  availableRoles: OrganizationRole[];
  assignedRoleIds: string[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

/**
 *
 * @param root0
 */
export function AssignRolesDialog({
  isOpen,
  onClose,
  userId,
  client,
  availableRoles,
  assignedRoleIds,
  onSuccess,
  onError,
}: AssignRolesDialogProps): React.JSX.Element {
  const msgs = defaultMessages.dialogs.assignRoles;
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setSelectedRoleIds([]);
    onClose();
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoleIds.length === 0) return;
    setIsLoading(true);
    try {
      await client.organization.members.roles.create(userId, { roles: selectedRoleIds });
      onSuccess(msgs.success);
      handleClose();
    } catch {
      onError(msgs.error);
    } finally {
      setIsLoading(false);
    }
  };

  const unassignedRoles = availableRoles.filter((r) => !assignedRoleIds.includes(r.id));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{msgs.title}</DialogTitle>
          <DialogDescription>{msgs.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          {unassignedRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">{msgs.noRoles}</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {unassignedRoles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2 hover:bg-muted"
                >
                  <Checkbox
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                    aria-label={role.name}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{role.name}</span>
                    {role.description && (
                      <span className="text-xs text-muted-foreground">{role.description}</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {msgs.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || selectedRoleIds.length === 0}
              aria-busy={isLoading}
            >
              {isLoading && <Spinner size="sm" className="mr-2" aria-hidden="true" />}
              {msgs.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
