'use client';

import { singleInviteFormSchema } from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useTranslator } from '../../../hooks/use-translator';
import type { SingleInviteFormProps } from '../../../types/my-organization/member-management/invite-member-types';
import { Button } from '../../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { TextField } from '../../ui/text-field';

import { RoleSelector } from './role-selector';

export function SingleInviteForm({
  onSubmit,
  roles,
  isLoadingRoles,
  isSubmitting,
  customMessages = {},
  classes = {},
}: SingleInviteFormProps) {
  const { t } = useTranslator('member_management.invite_member', customMessages);

  const form = useForm({
    resolver: zodResolver(singleInviteFormSchema),
    defaultValues: {
      email: '',
      roles: [] as string[],
    },
    mode: 'onBlur',
  });

  const handleSubmit = React.useCallback(
    (values: { email: string; roles: string[] }) => {
      onSubmit(values);
      form.reset();
    },
    [form, onSubmit],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email-input" className="text-sm font-medium">
                {t('form.email.label')}
              </FormLabel>
              <FormControl>
                <TextField
                  id="email-input"
                  type="email"
                  placeholder={t('form.email.placeholder')}
                  className={classes.InviteMember_EmailInput}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
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
            {t('form.submit')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
