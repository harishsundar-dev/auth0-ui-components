'use client';

import * as React from 'react';

import type {
  MemberInvitation,
  MemberRole,
  OrganizationMember,
} from '../../../types/my-organization/members-management/organization-members-manager-types';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { DataTable, type Column } from '../../ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { TextField } from '../../ui/text-field';

/* ============ MembersTable ============ */

interface MembersTableProps {
  members: OrganizationMember[];
  isLoading: boolean;
  searchQuery: string;
  onSearch: (query: string) => void;
  onUpdateRoles: (member: OrganizationMember) => void;
  onRemove: (member: OrganizationMember) => void;
  readOnly: boolean;
  t: (key: string, params?: Record<string, string>) => string;
}

export function MembersTable({
  members,
  isLoading,
  searchQuery,
  onSearch,
  onUpdateRoles,
  onRemove,
  readOnly,
  t,
}: MembersTableProps) {
  const columns: Column<OrganizationMember>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('members_tab.table.columns.name'),
        width: '20%',
        render: (member) => <span className="font-medium">{member.name}</span>,
      },
      {
        type: 'text',
        accessorKey: 'email',
        title: t('members_tab.table.columns.email'),
        width: '25%',
      },
      {
        type: 'text',
        accessorKey: 'roles',
        title: t('members_tab.table.columns.roles'),
        width: '20%',
        render: (member) => (
          <div className="flex flex-wrap gap-1">
            {member.roles.map((role) => (
              <Badge key={role.id} variant="secondary" size="sm">
                {role.name}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        type: 'text',
        accessorKey: 'lastLogin',
        title: t('members_tab.table.columns.last_login'),
        width: '20%',
        render: (member) => (
          <span>{member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : '—'}</span>
        ),
      },
      {
        type: 'actions',
        accessorKey: 'userId',
        title: '',
        width: '15%',
        render: (member) =>
          !readOnly ? (
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => onUpdateRoles(member)}>
                {t('members_tab.table.actions.update_roles')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onRemove(member)}>
                {t('members_tab.table.actions.remove')}
              </Button>
            </div>
          ) : null,
      },
    ],
    [t, readOnly, onUpdateRoles, onRemove],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <TextField
          placeholder={t('members_tab.search_placeholder')}
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <DataTable
        columns={columns}
        data={members}
        loading={isLoading}
        emptyState={{ title: t('members_tab.table.empty_message') }}
      />
    </div>
  );
}

/* ============ InvitationsTable ============ */

interface InvitationsTableProps {
  invitations: MemberInvitation[];
  isLoading: boolean;
  onDelete: (invitationId: string, email: string) => void;
  readOnly: boolean;
  t: (key: string, params?: Record<string, string>) => string;
}

export function InvitationsTable({
  invitations,
  isLoading,
  onDelete,
  readOnly,
  t,
}: InvitationsTableProps) {
  const columns: Column<MemberInvitation>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'inviteeEmail',
        title: t('invitations_tab.table.columns.email'),
        width: '25%',
      },
      {
        type: 'text',
        accessorKey: 'roles',
        title: t('invitations_tab.table.columns.roles'),
        width: '20%',
        render: (inv) => (
          <div className="flex flex-wrap gap-1">
            {inv.roles.map((role) => (
              <Badge key={role.id} variant="secondary" size="sm">
                {role.name}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        type: 'text',
        accessorKey: 'invitedBy',
        title: t('invitations_tab.table.columns.invited_by'),
        width: '20%',
      },
      {
        type: 'text',
        accessorKey: 'expiresAt',
        title: t('invitations_tab.table.columns.expires_at'),
        width: '15%',
        render: (inv) => <span>{new Date(inv.expiresAt).toLocaleDateString()}</span>,
      },
      {
        type: 'text',
        accessorKey: 'status',
        title: t('invitations_tab.table.columns.status'),
        width: '10%',
        render: (inv) => (
          <Badge variant={inv.status === 'pending' ? 'warning' : 'secondary'} size="sm">
            {inv.status}
          </Badge>
        ),
      },
      {
        type: 'actions',
        accessorKey: 'id',
        title: '',
        width: '10%',
        render: (inv) =>
          !readOnly ? (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => onDelete(inv.id, inv.inviteeEmail)}>
                {t('invitations_tab.table.actions.delete')}
              </Button>
            </div>
          ) : null,
      },
    ],
    [t, readOnly, onDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={invitations}
      loading={isLoading}
      emptyState={{ title: t('invitations_tab.table.empty_message') }}
    />
  );
}

/* ============ RemoveMemberDialog ============ */

interface RemoveMemberDialogProps {
  isOpen: boolean;
  member: OrganizationMember | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export function RemoveMemberDialog({
  isOpen,
  member,
  isLoading,
  onClose,
  onConfirm,
  t,
}: RemoveMemberDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('remove_member_dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('remove_member_dialog.description', { memberName: member?.name ?? '' })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('remove_member_dialog.cancel_button')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {t('remove_member_dialog.submit_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ DeleteInvitationDialog ============ */

interface DeleteInvitationDialogProps {
  isOpen: boolean;
  email: string;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export function DeleteInvitationDialog({
  isOpen,
  email,
  isLoading,
  onClose,
  onConfirm,
  t,
}: DeleteInvitationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('delete_invitation_dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('delete_invitation_dialog.description', { email })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('delete_invitation_dialog.cancel_button')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {t('delete_invitation_dialog.submit_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ UpdateRolesDialog ============ */

interface UpdateRolesDialogProps {
  isOpen: boolean;
  member: OrganizationMember | null;
  availableRoles: MemberRole[];
  selectedRoleIds: string[];
  isLoading: boolean;
  onClose: () => void;
  onRoleToggle: (roleId: string) => void;
  onConfirm: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export function UpdateRolesDialog({
  isOpen,
  member,
  availableRoles,
  selectedRoleIds,
  isLoading,
  onClose,
  onRoleToggle,
  onConfirm,
  t,
}: UpdateRolesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('update_roles_dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('update_roles_dialog.description', { memberName: member?.name ?? '' })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-4">
          <p className="text-sm font-medium">{t('update_roles_dialog.roles_label')}</p>
          <div className="flex flex-wrap gap-2">
            {availableRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => onRoleToggle(role.id)}
                className="cursor-pointer"
              >
                <Badge
                  variant={selectedRoleIds.includes(role.id) ? 'default' : 'outline'}
                  size="md"
                >
                  {role.name}
                </Badge>
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('update_roles_dialog.cancel_button')}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {t('update_roles_dialog.submit_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ InviteMemberDialog ============ */

interface InviteMemberDialogProps {
  isOpen: boolean;
  availableRoles: MemberRole[];
  isLoading: boolean;
  onClose: () => void;
  onInviteSingle: (email: string, roleIds: string[]) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export function InviteMemberDialog({
  isOpen,
  availableRoles,
  isLoading,
  onClose,
  onInviteSingle,
  t,
}: InviteMemberDialogProps) {
  const [email, setEmail] = React.useState('');
  const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);

  const handleClose = () => {
    setEmail('');
    setSelectedRoleIds([]);
    onClose();
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const handleSubmit = () => {
    if (!email.trim()) return;
    onInviteSingle(email.trim(), selectedRoleIds);
    setEmail('');
    setSelectedRoleIds([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('invite_member_dialog.title')}</DialogTitle>
          <DialogDescription>{t('invite_member_dialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {t('invite_member_dialog.single_invite.email_label')}
            </label>
            <TextField
              placeholder={t('invite_member_dialog.single_invite.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
          {availableRoles.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">
                {t('invite_member_dialog.single_invite.roles_label')}
              </p>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleToggle(role.id)}
                    className="cursor-pointer"
                  >
                    <Badge
                      variant={selectedRoleIds.includes(role.id) ? 'default' : 'outline'}
                      size="md"
                    >
                      {role.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t('invite_member_dialog.cancel_button')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !email.trim()}>
            {t('invite_member_dialog.single_invite.submit_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
