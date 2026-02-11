'use client';

import type { BulkInviteFormData, SingleInviteFormData } from '@auth0/universal-components-core';
import * as React from 'react';

import { useTranslator } from '../../../hooks/use-translator';
import { cn } from '../../../lib/theme-utils';
import type { InviteMemberDialogProps } from '../../../types/my-organization/member-management/invite-member-types';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

import { BulkInviteForm } from './bulk-invite-form';
import { SingleInviteForm } from './single-invite-form';

export function InviteMemberDialog({
  isOpen,
  onClose,
  organizationId,
  roles,
  isLoadingRoles,
  mode,
  onModeChange,
  onSubmit,
  isSubmitting,
  error,
  customMessages = {},
  classes = {},
  maxBulkInvites,
}: InviteMemberDialogProps) {
  const { t } = useTranslator('member_management.invite_member', customMessages);

  const handleSingleSubmit = React.useCallback(
    async (data: SingleInviteFormData) => {
      await onSubmit(data);
      onClose();
    },
    [onSubmit, onClose],
  );

  const handleBulkSubmit = React.useCallback(
    async (data: BulkInviteFormData) => {
      await onSubmit(data);
      onClose();
    },
    [onSubmit, onClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-2xl', classes.InviteMember_Dialog)}>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => onModeChange(value as 'single' | 'bulk')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">{t('mode.single')}</TabsTrigger>
            <TabsTrigger value="bulk">{t('mode.bulk')}</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-4">
            <SingleInviteForm
              onSubmit={handleSingleSubmit}
              roles={roles}
              isLoadingRoles={isLoadingRoles}
              isSubmitting={isSubmitting}
              customMessages={customMessages}
              classes={classes}
            />
          </TabsContent>

          <TabsContent value="bulk" className="mt-4">
            <BulkInviteForm
              onSubmit={handleBulkSubmit}
              roles={roles}
              isLoadingRoles={isLoadingRoles}
              isSubmitting={isSubmitting}
              maxBulkInvites={maxBulkInvites}
              customMessages={customMessages}
              classes={classes}
            />
          </TabsContent>
        </Tabs>

        {error && (
          <div className="text-destructive text-sm mt-2">{error.message || t('error.generic')}</div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className={classes.InviteMember_CancelButton}
          >
            {t('form.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
