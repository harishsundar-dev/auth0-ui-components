'use client';

import { bulkInviteFormSchema } from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useTranslator } from '../../../hooks/use-translator';
import type { BulkInviteFormProps } from '../../../types/my-organization/member-management/invite-member-types';
import { Alert } from '../../ui/alert';
import { Button } from '../../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';

import { RoleSelector } from './role-selector';

export function BulkInviteForm({
  onSubmit,
  roles,
  isLoadingRoles,
  isSubmitting,
  maxBulkInvites,
  customMessages = {},
  classes = {},
}: BulkInviteFormProps) {
  const { t } = useTranslator('member_management.invite_member', customMessages);

  const form = useForm({
    resolver: zodResolver(bulkInviteFormSchema),
    defaultValues: {
      emails: '',
      roles: [] as string[],
    },
    mode: 'onBlur',
  });

  const handleSubmit = React.useCallback(
    (values: { emails: string; roles: string[] }) => {
      const emailList = values.emails
        .split(/[,\n]/)
        .map((e) => e.trim())
        .filter(Boolean);

      if (emailList.length > maxBulkInvites) {
        form.setError('emails', {
          type: 'manual',
          message: t('form.emails.error.tooMany', { max: maxBulkInvites.toString() }),
        });
        return;
      }

      onSubmit(values);
      form.reset();
    },
    [form, onSubmit, maxBulkInvites, t],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="emails"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="emails-input" className="text-sm font-medium">
                {t('form.emails.label')}
              </FormLabel>
              <FormControl>
                <textarea
                  id="emails-input"
                  placeholder={t('form.emails.placeholder')}
                  className={`border-border/25 text-input-foreground shadow-input-resting hover:shadow-input-hover hover:border-border/0 focus-within:outline-primary focus-within:shadow-input-hover bg-input disabled:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex w-full rounded-3xl px-4 py-3 ring-4 ring-transparent outline-4 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] ${classes.InviteMember_EmailInput}`}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <div className="text-muted-foreground text-xs mt-1">
                {t('form.emails.hint', { max: maxBulkInvites.toString() })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="roles-selector" className="text-sm font-medium">
                {t('form.roles.label')}
              </FormLabel>
              <FormControl>
                <RoleSelector
                  roles={roles}
                  selectedRoles={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  isLoading={isLoadingRoles}
                  customMessages={customMessages}
                  className={classes.InviteMember_RoleSelector}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={classes.InviteMember_SubmitButton}
          >
            {t('form.submit_bulk')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
