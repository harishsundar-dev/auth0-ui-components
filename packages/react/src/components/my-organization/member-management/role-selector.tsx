'use client';

import type { OrganizationRole } from '@auth0/universal-components-core';
import * as React from 'react';

import { useTranslator } from '../../../hooks/use-translator';
import { cn } from '../../../lib/theme-utils';
import type { RoleSelectorProps } from '../../../types/my-organization/member-management/invite-member-types';
import { Badge } from '../../ui/badge';
import { Checkbox } from '../../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

export function RoleSelector({
  roles,
  selectedRoles,
  onChange,
  disabled = false,
  isLoading = false,
  error,
  customMessages = {},
  className,
}: RoleSelectorProps) {
  const { t } = useTranslator('member_management.invite_member', customMessages);

  const [isOpen, setIsOpen] = React.useState(false);

  const handleRoleToggle = React.useCallback(
    (roleId: string) => {
      const isSelected = selectedRoles.includes(roleId);
      if (isSelected) {
        onChange(selectedRoles.filter((id) => id !== roleId));
      } else {
        onChange([...selectedRoles, roleId]);
      }
    },
    [selectedRoles, onChange],
  );

  const handleSelectAll = React.useCallback(() => {
    onChange(roles.map((role) => role.id));
  }, [roles, onChange]);

  const handleClearAll = React.useCallback(() => {
    onChange([]);
  }, [onChange]);

  const selectedCount = selectedRoles.length;

  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="text-muted-foreground text-sm">{t('form.roles.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('w-full', className)}>
        <div className="text-destructive text-sm">{error}</div>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <div className="text-muted-foreground text-sm">{t('form.roles.empty')}</div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <Select open={isOpen} onOpenChange={setIsOpen}>
        <SelectTrigger className="w-full" disabled={disabled} aria-label={t('form.roles.label')}>
          <SelectValue
            placeholder={
              selectedCount > 0
                ? t('roleSelector.selected', { count: selectedCount.toString() })
                : t('form.roles.placeholder')
            }
          />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <div className="p-2 border-b">
            <div className="flex gap-2">
              <button
                type="button"
                className="text-primary hover:text-primary/80 text-sm font-medium"
                onClick={handleSelectAll}
              >
                {t('roleSelector.selectAll')}
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                type="button"
                className="text-primary hover:text-primary/80 text-sm font-medium"
                onClick={handleClearAll}
              >
                {t('roleSelector.clearAll')}
              </button>
            </div>
          </div>
          <div className="p-2 space-y-2">
            {roles.map((role) => {
              const isSelected = selectedRoles.includes(role.id);
              return (
                <div
                  key={role.id}
                  className="flex items-start gap-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{role.name}</div>
                    {role.description && (
                      <div className="text-muted-foreground text-xs mt-0.5">{role.description}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SelectContent>
      </Select>
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedRoles.map((roleId) => {
            const role = roles.find((r) => r.id === roleId);
            if (!role) return null;
            return (
              <Badge key={roleId} variant="secondary" className="text-xs">
                {role.name}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
