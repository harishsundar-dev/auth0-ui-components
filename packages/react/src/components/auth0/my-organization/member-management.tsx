/** @module member-management */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { InviteMemberDialog } from '@/components/auth0/my-organization/shared/member-management/invite-member-dialog';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { useInviteMember } from '@/hooks/my-organization/use-invite-member';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { MemberManagementProps } from '@/types/my-organization/member-management/member-management-types';

/**
 * Member management block entry point.
 *
 * Renders a controlled invite member dialog with email input, role selection,
 * duplicate-member detection, and full error/success state handling.
 *
 * @param props - {@link MemberManagementProps}
 * @param props.open - Whether the dialog is open
 * @param props.onClose - Callback when the dialog should close
 * @param props.onSuccess - Callback invoked on successful invitation
 * @param props.sdkClient - Injected SDK client for member API calls
 * @param props.variant - Design variant ('option1' | 'option2'). Defaults to 'option1'.
 * @param props.mode - Email input mode ('single' | 'multi'). Defaults to 'single'.
 * @param props.roleInputVariant - Role picker variant ('select' | 'radio'). Defaults to 'select'.
 * @param props.initialEmail - Pre-filled email address
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @returns Member management component
 *
 * @example
 * ```tsx
 * <MemberManagement
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSuccess={(emails, role) => console.log('Invited:', emails, role)}
 *   sdkClient={myOrgClient}
 * />
 * ```
 */
function MemberManagementComponent({
  open,
  onClose,
  onSuccess,
  sdkClient,
  variant = 'option1',
  mode: modeProp,
  roleInputVariant = 'select',
  initialEmail,
  customMessages = {},
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
}: MemberManagementProps): React.JSX.Element {
  // option2 variant forces multi-email mode
  const mode = variant === 'option2' ? 'multi' : (modeProp ?? 'single');
  const resolvedRoleInputVariant = variant === 'option2' ? 'radio' : roleInputVariant;

  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management.member_management', customMessages);

  const {
    state,
    roles,
    isRolesLoading,
    handleEmailChange,
    handleAddEmailChip,
    handleRemoveEmailChip,
    handleRoleChange,
    handleSubmit,
    handleDismiss,
    handleReset,
  } = useInviteMember({
    sdkClient,
    mode,
    initialEmail,
    customMessages,
    onSuccess,
  });

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const announceMessage = React.useMemo(() => {
    if (state.status === 'success') return t('alerts.success');
    if (state.status === 'error') return state.errorMsg;
    if (state.status === 'warning') return state.warnMsg;
    if (state.status === 'loading') return t('buttons.sending');
    return null;
  }, [state.status, state.errorMsg, state.warnMsg, t]);

  // Reset form state when dialog closes
  React.useEffect(() => {
    if (!open) {
      handleReset();
    }
  }, [open, handleReset]);

  return (
    <StyledScope style={currentStyles.variables}>
      <InviteMemberDialog
        open={open}
        onClose={onClose}
        state={state}
        roles={roles}
        isRolesLoading={isRolesLoading}
        mode={mode}
        roleInputVariant={resolvedRoleInputVariant}
        onEmailChange={handleEmailChange}
        onAddEmailChip={handleAddEmailChip}
        onRemoveEmailChip={handleRemoveEmailChip}
        onRoleChange={handleRoleChange}
        onSubmit={handleSubmit}
        onDismissAlert={handleDismiss}
        onSendAnyway={handleSubmit}
        dialogTitle={t('dialog.title')}
        dialogDescription={t('dialog.description')}
        emailLabel={t('form.email.label')}
        emailPlaceholder={t('form.email.placeholder')}
        emailHelperText={t('form.email.helper_text')}
        roleLabel={t('form.role.label')}
        rolePlaceholder={t('form.role.placeholder')}
        cancelLabel={t('buttons.cancel')}
        sendInviteLabel={t('buttons.send_invite')}
        sendingLabel={t('buttons.sending')}
        sendAnywayLabel={t('buttons.send_anyway')}
        announceMessage={announceMessage}
      />
    </StyledScope>
  );
}

/**
 * MemberManagement block.
 *
 * Invite member dialog with role assignment, validation states, and multi-email support.
 *
 * @see {@link MemberManagementProps}
 */
const MemberManagement = MemberManagementComponent;

export { MemberManagement };
