/** @module member-management */

import { getComponentStyles } from '@auth0/universal-components-core';
import { AlertCircleIcon, CheckCircleIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';
import { useMemberManagement } from '@/hooks/my-organization/use-member-management';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  MemberManagementProps,
  MemberManagementViewProps,
  MemberRole,
} from '@/types/my-organization/member-management/member-management-types';

// ===== Sub-components =====

interface EmailChipListProps {
  emails: string[];
  onRemove: (email: string) => void;
  onAdd: (email: string) => void;
  error?: string;
  disabled?: boolean;
  label: string;
  placeholder: string;
  addHint: string;
  removeLabel: (email: string) => string;
}

/**
 * Multi-value email chip/tag input.
 * @param props - Component props.
 * @param props.emails - Currently added emails.
 * @param props.onRemove - Callback to remove an email.
 * @param props.onAdd - Callback to add an email.
 * @param props.error - Validation error message.
 * @param props.disabled - Whether the input is disabled.
 * @param props.label - Field label.
 * @param props.placeholder - Input placeholder.
 * @param props.addHint - Hint text for adding emails.
 * @param props.removeLabel - Returns the aria-label for a remove button.
 * @returns JSX element
 * @internal
 */
function EmailChipList({
  emails,
  onRemove,
  onAdd,
  error,
  disabled,
  label,
  placeholder,
  addHint,
  removeLabel,
}: EmailChipListProps): React.JSX.Element {
  const [inputValue, setInputValue] = React.useState('');

  const commitEmail = React.useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAdd(trimmed);
      setInputValue('');
    }
  }, [inputValue, onAdd]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
        e.preventDefault();
        commitEmail();
      } else if (e.key === 'Backspace' && inputValue === '' && emails.length > 0) {
        const lastEmail = emails[emails.length - 1];
        if (lastEmail) onRemove(lastEmail);
      }
    },
    [commitEmail, inputValue, emails, onRemove],
  );

  return (
    <div>
      <Label htmlFor="email-chip-input" className="text-sm font-medium">
        {label}
      </Label>
      <div
        className={cn(
          'mt-2 flex min-h-10 flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          error && 'border-destructive',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {emails.map((email) => (
          <Badge key={email} variant="secondary" className="flex items-center gap-1">
            {email}
            <button
              type="button"
              aria-label={removeLabel(email)}
              disabled={disabled}
              onClick={() => onRemove(email)}
              className="ml-1 rounded-full outline-none hover:text-foreground focus:ring-2 focus:ring-ring"
            >
              <XIcon className="size-3" aria-hidden />
            </button>
          </Badge>
        ))}
        <input
          id="email-chip-input"
          type="email"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitEmail}
          placeholder={emails.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="min-w-32 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          aria-describedby={error ? 'email-chip-error' : 'email-chip-hint'}
          aria-invalid={!!error}
        />
      </div>
      {error ? (
        <p id="email-chip-error" className="mt-1.5 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <p id="email-chip-hint" className="mt-1 text-xs text-muted-foreground">
          {addHint}
        </p>
      )}
    </div>
  );
}

interface RoleSelectProps {
  value: string;
  onChange: (value: string) => void;
  roles: MemberRole[];
  error?: string;
  disabled?: boolean;
  label: string;
  placeholder: string;
}

/**
 * Role dropdown select field.
 * @param props - Component props.
 * @param props.value - Selected role ID.
 * @param props.onChange - Callback when role changes.
 * @param props.roles - Available roles.
 * @param props.error - Validation error message.
 * @param props.disabled - Whether the field is disabled.
 * @param props.label - Field label.
 * @param props.placeholder - Select placeholder.
 * @returns JSX element
 * @internal
 */
function RoleSelectField({
  value,
  onChange,
  roles,
  error,
  disabled,
  label,
  placeholder,
}: RoleSelectProps): React.JSX.Element {
  return (
    <div>
      <Label htmlFor="role-select" className="text-sm font-medium">
        {label}
      </Label>
      <div className="mt-2">
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger
            id="role-select"
            aria-invalid={!!error}
            aria-describedby={error ? 'role-select-error' : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p id="role-select-error" className="mt-1.5 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

interface RoleRadioGroupFieldProps {
  value: string;
  onChange: (value: string) => void;
  roles: MemberRole[];
  error?: string;
  disabled?: boolean;
  legend: string;
}

/**
 * Role radio group field.
 * @param props - Component props.
 * @param props.value - Selected role ID.
 * @param props.onChange - Callback when role changes.
 * @param props.roles - Available roles.
 * @param props.error - Validation error message.
 * @param props.disabled - Whether the field is disabled.
 * @param props.legend - Fieldset legend text.
 * @returns JSX element
 * @internal
 */
function RoleRadioGroupField({
  value,
  onChange,
  roles,
  error,
  disabled,
  legend,
}: RoleRadioGroupFieldProps): React.JSX.Element {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        aria-describedby={error ? 'role-radio-error' : undefined}
      >
        {roles.map((role) => (
          <div key={role.id} className="flex items-start space-x-3">
            <RadioGroupItem id={`role-${role.id}`} value={role.id} className="mt-0.5" />
            <div>
              <Label htmlFor={`role-${role.id}`} className="text-sm font-medium cursor-pointer">
                {role.name}
              </Label>
              {role.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
      {error && (
        <p id="role-radio-error" className="mt-1.5 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

// ===== View component =====

/**
 * @param props - View props.
 * @returns MemberManagement view element
 * @internal
 */
function MemberManagementView({
  open,
  onOpenChange,
  availableRoles,
  variant,
  roleInputVariant,
  styling,
  customMessages,
  dialogState,
  emails,
  role,
  errors,
  onAddEmail,
  onRemoveEmail,
  onSetRole,
  onSubmit,
  onDismiss,
  onReset,
  onProceedDespiteWarning,
}: MemberManagementViewProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const { isDarkMode } = useTheme();

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const [singleEmail, setSingleEmail] = React.useState('');

  const handleSingleEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSingleEmail(e.target.value);
  }, []);

  const handleSingleEmailBlur = React.useCallback(() => {
    if (singleEmail.trim()) {
      onAddEmail(singleEmail.trim());
    }
  }, [singleEmail, onAddEmail]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setSingleEmail('');
        onReset();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, onReset],
  );

  const isSubmitting = dialogState === 'submitting' || dialogState === 'checking_membership';
  const isSuccess = dialogState === 'success';
  const isError = dialogState === 'error';
  const isWarning = dialogState === 'warning';

  return (
    <div style={currentStyles.variables}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('invite_member.dialog.title')}</DialogTitle>
            {!isSuccess && (
              <DialogDescription>{t('invite_member.dialog.description')}</DialogDescription>
            )}
          </DialogHeader>

          {/* Success state */}
          {isSuccess && (
            <div
              className="flex flex-col items-center gap-4 py-6 text-center"
              aria-live="polite"
              aria-atomic="true"
            >
              <CheckCircleIcon className="size-12 text-success-foreground" aria-hidden />
              <div>
                <p className="font-semibold">{t('invite_member.success.title')}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {emails.length === 1
                    ? t('invite_member.success.description', { email: emails[0] ?? '' })
                    : t('invite_member.success.description_multiple', {
                        count: String(emails.length),
                      })}
                </p>
              </div>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                {t('invite_member.buttons.dismiss')}
              </Button>
            </div>
          )}

          {/* Main form */}
          {!isSuccess && (
            <div className="flex flex-col gap-4">
              {/* Error banner */}
              {isError && (
                <Alert variant="destructive" role="alert">
                  <AlertCircleIcon className="size-4" aria-hidden />
                  <AlertTitle>{t('invite_member.errors.generic')}</AlertTitle>
                  {errors.submission && <AlertDescription>{errors.submission}</AlertDescription>}
                </Alert>
              )}

              {/* Warning banner */}
              {isWarning && (
                <Alert variant="warning" role="alert">
                  <AlertCircleIcon className="size-4" aria-hidden />
                  <AlertTitle>{t('invite_member.warning.already_member')}</AlertTitle>
                </Alert>
              )}

              {/* Loading banner */}
              {isSubmitting && (
                <div
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  aria-live="polite"
                >
                  <Spinner className="size-4" />
                  <span>
                    {dialogState === 'checking_membership'
                      ? t('invite_member.loading.checking')
                      : t('invite_member.loading.submitting')}
                  </span>
                </div>
              )}

              {/* Email input — option1: single text field */}
              {variant === 'option1' && (
                <div>
                  <Label htmlFor="single-email-input" className="text-sm font-medium">
                    {t('invite_member.form.email_label')}
                  </Label>
                  <TextField
                    id="single-email-input"
                    type="email"
                    value={singleEmail}
                    onChange={handleSingleEmailChange}
                    onBlur={handleSingleEmailBlur}
                    placeholder={t('invite_member.form.email_placeholder')}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'single-email-error' : undefined}
                    className="mt-2"
                  />
                  {errors.email && (
                    <p
                      id="single-email-error"
                      className="mt-1.5 text-sm text-destructive"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
              )}

              {/* Email input — option2: chip/tag multi-email input */}
              {variant === 'option2' && (
                <EmailChipList
                  emails={emails}
                  onAdd={onAddEmail}
                  onRemove={onRemoveEmail}
                  error={errors.email}
                  disabled={isSubmitting}
                  label={t('invite_member.form.email_label')}
                  placeholder={t('invite_member.form.email_placeholder')}
                  addHint={t('invite_member.chip.add_hint')}
                  removeLabel={(email) => t('invite_member.chip.remove', { email })}
                />
              )}

              {/* Role input */}
              {roleInputVariant === 'select' ? (
                <RoleSelectField
                  value={role}
                  onChange={onSetRole}
                  roles={availableRoles}
                  error={errors.role}
                  disabled={isSubmitting}
                  label={t('invite_member.form.role_label')}
                  placeholder={t('invite_member.form.role_placeholder')}
                />
              ) : (
                <RoleRadioGroupField
                  value={role}
                  onChange={onSetRole}
                  roles={availableRoles}
                  error={errors.role}
                  disabled={isSubmitting}
                  legend={t('invite_member.form.role_legend')}
                />
              )}

              {/* Footer actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                >
                  {t('invite_member.buttons.cancel')}
                </Button>

                {isWarning ? (
                  <>
                    <Button variant="outline" onClick={onDismiss} disabled={isSubmitting}>
                      {t('invite_member.buttons.dismiss')}
                    </Button>
                    <Button onClick={onProceedDespiteWarning} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Spinner className="size-4" />
                      ) : (
                        t('invite_member.buttons.proceed')
                      )}
                    </Button>
                  </>
                ) : (
                  <Button onClick={onSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Spinner className="size-4" />
                    ) : (
                      t('invite_member.buttons.send_invite')
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== Main container component =====

/**
 * MemberManagement component.
 *
 * Renders an invite member dialog for organization member administration.
 * Supports single email input (option1) and multi-email chip input (option2)
 * variants, as well as combobox and radio group role selection styles.
 *
 * @param props - {@link MemberManagementProps}
 * @returns MemberManagement component
 *
 * @example
 * ```tsx
 * <MemberManagement
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   availableRoles={roles}
 *   onInvite={async (emails, roleId) => {
 *     await inviteMembers(emails, roleId);
 *   }}
 *   onSuccess={(emails) => console.log('Invited:', emails)}
 * />
 * ```
 */
function MemberManagement({
  open,
  onOpenChange,
  availableRoles = [],
  onInvite,
  onCheckMembership,
  onSuccess,
  variant = 'option1',
  roleInputVariant = 'select',
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
}: MemberManagementProps): React.JSX.Element {
  const {
    dialogState,
    emails,
    role,
    errors,
    addEmail,
    removeEmail,
    setRole,
    submit,
    dismiss,
    reset,
    proceedDespiteWarning,
  } = useMemberManagement({
    onInvite,
    onCheckMembership,
    onSuccess,
    customMessages,
    variant,
  });

  return (
    <MemberManagementView
      open={open}
      onOpenChange={onOpenChange}
      availableRoles={availableRoles}
      variant={variant}
      roleInputVariant={roleInputVariant}
      styling={styling}
      customMessages={customMessages}
      dialogState={dialogState}
      emails={emails}
      role={role}
      errors={errors}
      onAddEmail={addEmail}
      onRemoveEmail={removeEmail}
      onSetRole={setRole}
      onSubmit={submit}
      onDismiss={dismiss}
      onReset={reset}
      onProceedDespiteWarning={proceedDespiteWarning}
    />
  );
}

export { MemberManagement, MemberManagementView };
