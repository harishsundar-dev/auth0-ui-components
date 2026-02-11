import type {
  BulkInviteFormData,
  Invitation,
  SingleInviteFormData,
} from '@auth0/universal-components-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import type { UseInviteMemberReturn } from '../../../types/my-organization/member-management/invite-member-types';
import { useCoreClient } from '../../use-core-client';

/**
 * Query key for invitations
 */
export const INVITATIONS_QUERY_KEY = 'organization-invitations';

/**
 * Hook for managing organization member invitations
 * @param organizationId - The organization ID
 * @returns Invitation mutation functions and state
 */
export function useInviteMember(organizationId: string): UseInviteMemberReturn {
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<Error | null>(null);

  const singleInviteMutation = useMutation({
    mutationFn: async (data: SingleInviteFormData): Promise<Invitation> => {
      const api = coreClient!.getMyOrganizationApiClient();
      const response = await api.organization.invitations.create({
        invitee: { email: data.email },
        roles: data.roles.length > 0 ? data.roles : undefined,
        send_invitation_email: true,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVITATIONS_QUERY_KEY, organizationId] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err);
    },
  });

  const bulkInviteMutation = useMutation({
    mutationFn: async (data: BulkInviteFormData): Promise<Invitation[]> => {
      const emails = data.emails
        .split(/[,\n]/)
        .map((e) => e.trim())
        .filter(Boolean);

      const api = coreClient!.getMyOrganizationApiClient();

      // Send invitations in parallel
      const invitations = await Promise.all(
        emails.map((email) =>
          api.organization.invitations.create({
            invitee: { email },
            roles: data.roles.length > 0 ? data.roles : undefined,
            send_invitation_email: true,
          }),
        ),
      );

      return invitations;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVITATIONS_QUERY_KEY, organizationId] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err);
    },
  });

  const sendInvitation = React.useCallback(
    async (data: SingleInviteFormData): Promise<Invitation> => {
      return singleInviteMutation.mutateAsync(data);
    },
    [singleInviteMutation],
  );

  const sendBulkInvitations = React.useCallback(
    async (data: BulkInviteFormData): Promise<Invitation[]> => {
      return bulkInviteMutation.mutateAsync(data);
    },
    [bulkInviteMutation],
  );

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    sendInvitation,
    sendBulkInvitations,
    isSubmitting: singleInviteMutation.isPending || bulkInviteMutation.isPending,
    error: error || singleInviteMutation.error || bulkInviteMutation.error,
    resetError,
  };
}
