'use client';

import {
  getComponentStyles,
  MY_ORGANIZATION_INVITE_MEMBER_SCOPES,
  type BulkInviteFormData,
  type SingleInviteFormData,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { InviteMemberDialog } from '../../../components/my-organization/member-management/invite-member-dialog';
import { Button } from '../../../components/ui/button';
import { showToast } from '../../../components/ui/toast';
import { withMyOrganizationService } from '../../../hoc/with-services';
import { useInviteMember } from '../../../hooks/my-organization/member-management/use-invite-member';
import { useOrganizationRoles } from '../../../hooks/my-organization/member-management/use-organization-roles';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import type { InviteMemberProps } from '../../../types/my-organization/member-management/invite-member-types';

/**
 * InviteMember Block Component
 *
 * Provides organization administrators with the ability to invite new members to their organization.
 * Supports both single and bulk invitation modes with optional role assignment.
 *
 * Features:
 * - Single invite mode: Invite one member at a time with email and role selection
 * - Bulk invite mode: Invite multiple members simultaneously via comma-separated emails
 * - Role assignment: Assign one or more roles to invited members during the invitation process
 * - Success confirmation: Display confirmation when invitations are sent successfully
 *
 * @example
 * ```tsx
 * <InviteMember
 *   organizationId="org_123"
 *   onInviteSent={(invitation) => console.log('Invited:', invitation)}
 *   maxBulkInvites={50}
 * />
 * ```
 */
function InviteMemberComponent({
  organizationId,
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly = false,
  onInviteSent,
  onError,
  defaultMode = 'single',
  maxBulkInvites = 100,
}: InviteMemberProps): React.JSX.Element {
  const { t } = useTranslator('member_management.invite_member', customMessages);
  const { isDarkMode } = useTheme();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'single' | 'bulk'>(defaultMode);

  const { sendInvitation, sendBulkInvitations, isSubmitting, error, resetError } =
    useInviteMember(organizationId);

  const { roles, isLoading: isLoadingRoles } = useOrganizationRoles(organizationId);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleOpenDialog = React.useCallback(() => {
    resetError();
    setIsDialogOpen(true);
  }, [resetError]);

  const handleCloseDialog = React.useCallback(() => {
    setIsDialogOpen(false);
    resetError();
  }, [resetError]);

  const handleSubmit = React.useCallback(
    async (data: SingleInviteFormData | BulkInviteFormData) => {
      try {
        if ('emails' in data) {
          // Bulk invite
          const invitations = await sendBulkInvitations(data);
          showToast({
            type: 'success',
            message: t('success.message_bulk', { count: invitations.length.toString() }),
          });
          onInviteSent?.(invitations);
        } else {
          // Single invite
          const invitation = await sendInvitation(data);
          showToast({
            type: 'success',
            message: t('success.message', { email: data.email }),
          });
          onInviteSent?.(invitation);
        }
      } catch (err) {
        const error = err as Error;
        showToast({
          type: 'error',
          message: error.message || t('error.generic'),
        });
        onError?.(error);
        throw err;
      }
    },
    [sendInvitation, sendBulkInvitations, onInviteSent, onError, t],
  );

  if (readOnly) {
    return <></>;
  }

  return (
    <div style={currentStyles.variables}>
      <Button onClick={handleOpenDialog} disabled={isSubmitting}>
        {t('trigger.button')}
      </Button>

      <InviteMemberDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        organizationId={organizationId}
        roles={roles}
        isLoadingRoles={isLoadingRoles}
        mode={mode}
        onModeChange={setMode}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        customMessages={customMessages}
        classes={styling.classes}
        maxBulkInvites={maxBulkInvites}
      />
    </div>
  );
}

/**
 * InviteMember block wrapped with MyOrganization service HOC
 * Ensures required OAuth scopes are available before rendering
 */
export const InviteMember = withMyOrganizationService(
  InviteMemberComponent,
  MY_ORGANIZATION_INVITE_MEMBER_SCOPES,
);
