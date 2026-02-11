import {
  createInvitationCreateSchema,
  parseEmailList,
  type InternalInvitationCreateFormValues,
  type Role,
  type InvitationCreateMessages,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useTranslator } from '../../../../hooks/use-translator';
import { cn } from '../../../../lib/theme-utils';
import { Checkbox } from '../../../ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
  FormDescription,
} from '../../../ui/form';
import { Modal } from '../../../ui/modal';
import { TextField } from '../../../ui/text-field';

export interface InvitationCreateModalProps {
  translatorKey?: string;
  className?: string;
  customMessages?: Partial<InvitationCreateMessages>;
  isOpen: boolean;
  isLoading: boolean;
  roles: Role[];
  schema?: Record<string, unknown>;
  onClose: () => void;
  onCreate: (emails: string[], roles: string[]) => Promise<void>;
}

export function InvitationCreateModal({
  translatorKey = 'invitations_management.invitation_create.modal',
  className,
  customMessages,
  isOpen,
  isLoading,
  roles,
  schema,
  onClose,
  onCreate,
}: InvitationCreateModalProps) {
  const { t } = useTranslator(translatorKey, customMessages);

  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);
  const [emailError, setEmailError] = React.useState<string>('');

  const invitationCreateSchema = React.useMemo(
    () => createInvitationCreateSchema(schema),
    [schema],
  );

  const form = useForm<InternalInvitationCreateFormValues>({
    resolver: zodResolver(invitationCreateSchema),
    defaultValues: {
      email_list: '',
      roles: [],
    },
    mode: 'onBlur',
  }) as ReturnType<typeof useForm<InternalInvitationCreateFormValues>>;

  const handleCreate = React.useCallback(
    async (values: InternalInvitationCreateFormValues) => {
      if (!values.email_list) return;

      try {
        // Parse and validate emails
        const emails = parseEmailList(values.email_list, 10);
        await onCreate(emails, selectedRoles);
        form.reset();
        setSelectedRoles([]);
        setEmailError('');
      } catch (error) {
        if (error instanceof Error) {
          setEmailError(error.message);
        }
      }
    },
    [form, onCreate, selectedRoles],
  );

  const handleClose = React.useCallback(() => {
    form.reset();
    setSelectedRoles([]);
    setEmailError('');
    onClose();
  }, [form, onClose]);

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      void form.handleSubmit(handleCreate)();
    },
    [form, handleCreate],
  );

  const handleRoleToggle = React.useCallback((roleId: string, checked: boolean) => {
    setSelectedRoles((prev) => (checked ? [...prev, roleId] : prev.filter((id) => id !== roleId)));
  }, []);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      className={cn('p-10', className)}
      title={t('title')}
      description={t('description')}
      content={
        <div className="space-y-6">
          <Form {...form}>
            <form id="invitation-create-form" onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="email_list"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email-list" className="text-sm font-medium">
                      {t('field.email_label')}
                    </FormLabel>
                    <FormControl>
                      <TextField
                        id="email-list"
                        type="text"
                        placeholder={t('field.email_placeholder')}
                        className="mt-2"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('field.email_hint')}</FormDescription>
                    {emailError && (
                      <p className="text-sm font-medium text-destructive">{emailError}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {roles.length > 0 && (
                <div className="space-y-3">
                  <FormLabel className="text-sm font-medium">{t('field.roles_label')}</FormLabel>
                  <FormDescription>{t('field.roles_hint')}</FormDescription>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={(checked) =>
                            handleRoleToggle(role.id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {role.name}
                          {role.description && (
                            <span className="block text-xs text-muted-foreground font-normal">
                              {role.description}
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
      }
      modalActions={{
        isLoading,
        nextAction: {
          type: 'button',
          label: isLoading ? t('actions.sending_button_text') : t('actions.send_button_text'),
          variant: 'primary',
          disabled: isLoading,
          onClick: (e) => {
            e.preventDefault();
            void form.handleSubmit(handleCreate)();
          },
        },
        previousAction: {
          label: t('actions.cancel_button_text'),
          onClick: handleClose,
        },
      }}
    />
  );
}
