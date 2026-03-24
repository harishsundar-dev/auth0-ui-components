/**
 * Invite member form — orchestrates email and role sub-fields.
 * @module invite-member-form
 * @internal
 */

import * as React from 'react';

import { EmailChipInput } from '@/components/auth0/my-organization/shared/member-management/email-chip-input';
import { EmailInputField } from '@/components/auth0/my-organization/shared/member-management/email-input-field';
import { FormActionBar } from '@/components/auth0/my-organization/shared/member-management/form-action-bar';
import { RoleRadioGroup } from '@/components/auth0/my-organization/shared/member-management/role-radio-group';
import { RoleSelectField } from '@/components/auth0/my-organization/shared/member-management/role-select-field';
import { Spinner } from '@/components/ui/spinner';
import type {
  EmailInputMode,
  InviteMemberState,
  OrganizationRole,
  RoleInputVariant,
} from '@/types/my-organization/member-management/member-management-types';

interface InviteMemberFormProps {
  state: InviteMemberState;
  roles: OrganizationRole[];
  isRolesLoading: boolean;
  mode: EmailInputMode;
  roleInputVariant: RoleInputVariant;
  onEmailChange: (email: string) => void;
  onAddEmailChip: (email: string) => void;
  onRemoveEmailChip: (email: string) => void;
  onRoleChange: (role: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  emailLabel: string;
  emailPlaceholder: string;
  emailHelperText: string;
  roleLabel: string;
  rolePlaceholder: string;
  cancelLabel: string;
  sendInviteLabel: string;
  sendingLabel: string;
}

/**
 * Renders the invite member form with email input and role selector.
 * @param props - Component props
 * @returns Invite member form element
 * @internal
 */
export function InviteMemberForm({
  state,
  roles,
  isRolesLoading,
  mode,
  roleInputVariant,
  onEmailChange,
  onAddEmailChip,
  onRemoveEmailChip,
  onRoleChange,
  onSubmit,
  onCancel,
  emailLabel,
  emailPlaceholder,
  emailHelperText,
  roleLabel,
  rolePlaceholder,
  cancelLabel,
  sendInviteLabel,
  sendingLabel,
}: InviteMemberFormProps): React.JSX.Element {
  const isLoading = state.status === 'loading';
  const isDisabled = isLoading || state.status === 'success';

  const canSubmit =
    !isDisabled && (mode === 'multi' ? state.emails.length > 0 : !!state.email) && !!state.role;

  return (
    <form
      aria-busy={isLoading}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {mode === 'multi' ? (
        <EmailChipInput
          emails={state.emails}
          onAdd={onAddEmailChip}
          onRemove={onRemoveEmailChip}
          label={emailLabel}
          placeholder={emailPlaceholder}
          helperText={emailHelperText}
          error={state.fieldErrors.email}
          disabled={isDisabled}
        />
      ) : (
        <EmailInputField
          value={state.email}
          onChange={onEmailChange}
          label={emailLabel}
          placeholder={emailPlaceholder}
          helperText={emailHelperText}
          error={state.fieldErrors.email}
          disabled={isDisabled}
        />
      )}

      {isRolesLoading ? (
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
        </div>
      ) : roleInputVariant === 'radio' ? (
        <RoleRadioGroup
          value={state.role}
          onChange={onRoleChange}
          roles={roles}
          label={roleLabel}
          error={state.fieldErrors.role}
          disabled={isDisabled}
        />
      ) : (
        <RoleSelectField
          value={state.role}
          onChange={onRoleChange}
          roles={roles}
          label={roleLabel}
          placeholder={rolePlaceholder}
          error={state.fieldErrors.role}
          disabled={isDisabled}
        />
      )}

      <FormActionBar
        onCancel={onCancel}
        onSubmit={onSubmit}
        isLoading={isLoading}
        isDisabled={!canSubmit}
        cancelLabel={cancelLabel}
        sendInviteLabel={sendInviteLabel}
        sendingLabel={sendingLabel}
      />
    </form>
  );
}
