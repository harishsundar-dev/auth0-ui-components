/**
 * Member detail view – profile info, roles management, and danger zone.
 * @module member-detail
 */

import { ArrowLeft, Check, Plus, Shield, Trash2 } from 'lucide-react';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemberDetail } from '@/hooks/my-organization/use-member-detail';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  ConfirmModalState,
  MemberDetailTab,
  MemberManagementMessages,
  OrgMemberRole,
} from '@/types/my-organization/member-management';

export interface MemberDetailProps {
  userId: string;
  onBack: () => void;
  onConfirmModal: (modal: ConfirmModalState) => void;
  readOnly: boolean;
  customMessages?: Partial<MemberManagementMessages>;
  className?: string;
}

/**
 * Formats an ISO date string for display.
 * @param dateStr - ISO date string.
 * @returns Formatted date or dash.
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
}

/**
 * Member detail view component.
 * @param root0 - Component props.
 * @returns JSX element.
 */
export function MemberDetail({
  userId,
  onBack,
  onConfirmModal,
  readOnly,
  customMessages = {},
  className,
}: MemberDetailProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const {
    member,
    roles,
    isLoading,
    assignRole,
    removeRole: _removeRole,
  } = useMemberDetail(userId, customMessages);

  const [activeTab, setActiveTab] = React.useState<MemberDetailTab>('details');
  const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [assignRoleId, setAssignRoleId] = React.useState('');
  const [isAssigning, setIsAssigning] = React.useState(false);

  const displayName = member?.name || member?.email || member?.nickname || userId;
  const hasLastLogin = !!member?.last_login;

  const toggleRole = React.useCallback((roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  }, []);

  const handleAssignRole = React.useCallback(async () => {
    if (!assignRoleId) return;
    setIsAssigning(true);
    try {
      await assignRole(assignRoleId);
      showToast({ type: 'success', message: t('toasts.role_assigned_success') });
      setAssignDialogOpen(false);
      setAssignRoleId('');
    } finally {
      setIsAssigning(false);
    }
  }, [assignRoleId, assignRole, t]);

  const handleRemoveSelectedRoles = React.useCallback(() => {
    if (selectedRoleIds.length === 0) return;

    if (selectedRoleIds.length === 1) {
      const role = roles.find((r) => r.id === selectedRoleIds[0]);
      onConfirmModal({
        type: 'removeSingleRole',
        userId,
        roleId: selectedRoleIds[0]!,
        roleName: role?.name ?? '',
        memberName: displayName,
      });
    } else {
      const roleNames = selectedRoleIds
        .map((id) => roles.find((r) => r.id === id)?.name ?? '')
        .filter(Boolean);
      onConfirmModal({
        type: 'bulkRemoveRoles',
        userId,
        roleIds: selectedRoleIds,
        roleNames,
        memberName: displayName,
      });
    }
  }, [selectedRoleIds, roles, userId, displayName, onConfirmModal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
        <ArrowLeft className="h-4 w-4" />
        {t('member_detail.back_button')}
      </Button>

      <h2 className="text-xl font-semibold">{displayName}</h2>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as MemberDetailTab)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details" className="text-sm">
            {t('member_detail.tabs.details')}
          </TabsTrigger>
          <TabsTrigger value="roles" className="text-sm">
            {t('member_detail.tabs.roles')}
          </TabsTrigger>
        </TabsList>

        {/* Details tab */}
        <TabsContent value="details">
          <div className="space-y-4 rounded-md border p-4">
            <DetailRow label={t('member_detail.details.name')} value={member?.name} />
            <DetailRow label={t('member_detail.details.email')} value={member?.email} />
            <DetailRow
              label={t('member_detail.details.created_at')}
              value={formatDate(member?.created_at)}
            />
            <DetailRow
              label={t('member_detail.details.last_login')}
              value={formatDate(member?.last_login)}
            />
            <DetailRow
              label={t('member_detail.details.status')}
              value={
                hasLastLogin
                  ? t('member_detail.details.status_active')
                  : t('member_detail.details.status_inactive')
              }
              badge
              badgeVariant={hasLastLogin ? 'success' : 'secondary'}
            />
          </div>
        </TabsContent>

        {/* Roles tab */}
        <TabsContent value="roles">
          <div className="space-y-4">
            {!readOnly && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setAssignDialogOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  {t('member_detail.roles.assign_roles')}
                </Button>
                {selectedRoleIds.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleRemoveSelectedRoles}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    {t('member_detail.roles.remove_roles')}
                  </Button>
                )}
              </div>
            )}

            {roles.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                {t('member_detail.roles.empty_message')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {!readOnly && <TableHead className="w-10" />}
                    <TableHead>{t('member_detail.roles.title')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      {!readOnly && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRoleIds.includes(role.id)}
                            onCheckedChange={() => toggleRole(role.id)}
                            aria-label={role.name}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{role.name}</p>
                            {role.description && (
                              <p className="text-xs text-muted-foreground">{role.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Danger zone */}
      {!readOnly && (
        <>
          <Separator />
          <div className="space-y-3 rounded-md border border-destructive/30 p-4">
            <h3 className="text-base font-semibold text-destructive">
              {t('member_detail.danger_zone.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('member_detail.danger_zone.remove_member_description')}
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                onConfirmModal({
                  type: 'deleteSingleMember',
                  userId,
                  displayName,
                })
              }
            >
              {t('member_detail.danger_zone.remove_member')}
            </Button>
          </div>
        </>
      )}

      {/* Assign roles dialog */}
      <AssignRolesDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssign={handleAssignRole}
        assignRoleId={assignRoleId}
        setAssignRoleId={setAssignRoleId}
        isAssigning={isAssigning}
        existingRoles={roles}
        customMessages={customMessages}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

interface DetailRowProps {
  label: string;
  value?: string;
  badge?: boolean;
  badgeVariant?: 'success' | 'secondary' | 'default';
}

/**
 * Detail row displaying a label-value pair.
 * @param root0 - Component props.
 * @returns JSX element.
 */
function DetailRow({ label, value, badge, badgeVariant }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {badge ? <Badge variant={badgeVariant}>{value ?? '—'}</Badge> : <span>{value ?? '—'}</span>}
    </div>
  );
}

interface AssignRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: () => void;
  assignRoleId: string;
  setAssignRoleId: (id: string) => void;
  isAssigning: boolean;
  existingRoles: OrgMemberRole[];
  customMessages: Partial<MemberManagementMessages>;
}

/**
 * Dialog for assigning roles to organization members.
 * @param root0 - Component props
 * @returns The assign roles dialog component
 */
function AssignRolesDialog({
  open,
  onOpenChange,
  onAssign,
  assignRoleId,
  setAssignRoleId,
  isAssigning,
  customMessages,
}: AssignRolesDialogProps) {
  const { t } = useTranslator('member_management', customMessages);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('confirmation.assign_roles.title')}</DialogTitle>
          <DialogDescription>{t('confirmation.assign_roles.description')}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium" htmlFor="assign-role-id">
            {t('member_detail.roles.title')}
          </label>
          <input
            id="assign-role-id"
            type="text"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={assignRoleId}
            onChange={(e) => setAssignRoleId(e.target.value)}
            placeholder="role_id"
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isAssigning}>
              {t('confirmation.assign_roles.cancel')}
            </Button>
          </DialogClose>
          <Button onClick={onAssign} disabled={isAssigning || !assignRoleId}>
            <Check className="mr-1 h-4 w-4" />
            {t('confirmation.assign_roles.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
