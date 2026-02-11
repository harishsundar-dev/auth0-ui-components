import {
  type Invitation,
  type Role,
  BusinessError,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type {
  UseInvitationsTableOptions,
  UseInvitationsTableResult,
} from '../../../types/my-organization/invitations-management/invitations-table-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

const invitationsQueryKeys = {
  all: ['invitations'] as const,
  list: (params?: { page?: number; pageSize?: number; roleFilter?: string | null }) =>
    [...invitationsQueryKeys.all, 'list', params] as const,
  roles: () => ['roles'] as const,
};

export function useInvitationsTable({
  createAction,
  resendAction,
  deleteAction,
  customMessages,
  pageSize = 10,
}: UseInvitationsTableOptions): UseInvitationsTableResult {
  const { t } = useTranslator('invitations_management.invitations_table.notifications', customMessages);
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | null>(null);

  // Fetch invitations
  const invitationsQuery = useQuery({
    queryKey: invitationsQueryKeys.list({ page: currentPage, pageSize, roleFilter: selectedRoleFilter }),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organization.members.invitations.list({
        page: currentPage - 1, // API is 0-indexed
        per_page: pageSize,
        include_totals: true,
      });

      let invitations: Invitation[] = response?.invitations ?? [];
      const total = response?.total ?? invitations.length;

      // Client-side role filtering if needed
      if (selectedRoleFilter) {
        invitations = invitations.filter((inv) => inv.roles?.includes(selectedRoleFilter));
      }

      return { invitations, total };
    },
    enabled: !!coreClient,
  });

  // Fetch roles
  const rolesQuery = useQuery({
    queryKey: invitationsQueryKeys.roles(),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organization.roles.list({
        per_page: 100, // Get all roles
      });
      return response?.roles ?? [];
    },
    enabled: !!coreClient,
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async ({ emails, roles }: { emails: string[]; roles: string[] }): Promise<Invitation[]> => {
      const invitations: Invitation[] = [];
      
      if (createAction?.onBefore) {
        // Call onBefore with the array of emails
        const shouldContinue = createAction.onBefore(invitations);
        if (!shouldContinue) {
          throw new BusinessError({ message: t('invitation_create.on_before') });
        }
      }

      // Create invitation for each email
      for (const email of emails) {
        const invitation = await coreClient!
          .getMyOrganizationApiClient()
          .organization.members.invitations.create({
            invitee: { email },
            roles,
            send_invitation_email: true,
          });
        invitations.push(invitation);
      }

      return invitations;
    },
    onSuccess: (result) => {
      createAction?.onAfter?.(result);
      queryClient.invalidateQueries({ queryKey: invitationsQueryKeys.all });
    },
  });

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitation: Invitation): Promise<Invitation> => {
      if (resendAction?.onBefore && !resendAction.onBefore(invitation)) {
        throw new BusinessError({ message: t('invitation_resend.on_before') });
      }

      // Check if resend endpoint exists, otherwise recreate the invitation
      try {
        // Attempt to resend - this may not be available in all SDK versions
        const response = await coreClient!
          .getMyOrganizationApiClient()
          .organization.members.invitations.resend?.(invitation.id);
        return response || invitation;
      } catch (error) {
        // If resend is not available, delete and recreate
        await coreClient!
          .getMyOrganizationApiClient()
          .organization.members.invitations.delete(invitation.id);
        
        const newInvitation = await coreClient!
          .getMyOrganizationApiClient()
          .organization.members.invitations.create({
            invitee: { email: invitation.invitee.email },
            roles: invitation.roles,
            send_invitation_email: true,
          });
        return newInvitation;
      }
    },
    onSuccess: (result) => {
      resendAction?.onAfter?.(result);
      queryClient.invalidateQueries({ queryKey: invitationsQueryKeys.all });
    },
  });

  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitation: Invitation): Promise<void> => {
      if (deleteAction?.onBefore && !deleteAction.onBefore(invitation)) {
        throw new BusinessError({ message: t('invitation_delete.on_before') });
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.invitations.delete(invitation.id);
    },
    onSuccess: (_, invitation) => {
      deleteAction?.onAfter?.(invitation);
      queryClient.invalidateQueries({ queryKey: invitationsQueryKeys.all });
    },
  });

  return {
    invitations: invitationsQuery.data?.invitations ?? [],
    roles: rolesQuery.data ?? [],
    totalInvitations: invitationsQuery.data?.total ?? 0,
    currentPage,
    isFetchingInvitations: invitationsQuery.isLoading,
    isFetchingRoles: rolesQuery.isLoading,
    isCreating: createInvitationMutation.isPending,
    isDeleting: deleteInvitationMutation.isPending,
    isResending: resendInvitationMutation.isPending,
    selectedRoleFilter,
    setSelectedRoleFilter,
    setCurrentPage,
    fetchInvitations: async () => {
      await queryClient.invalidateQueries({ queryKey: invitationsQueryKeys.all });
    },
    onCreateInvitation: async (emails, roles) => {
      try {
        return await createInvitationMutation.mutateAsync({ emails, roles });
      } catch {
        return null;
      }
    },
    onResendInvitation: async (invitation) => {
      try {
        return await resendInvitationMutation.mutateAsync(invitation);
      } catch {
        return null;
      }
    },
    onDeleteInvitation: (invitation) => deleteInvitationMutation.mutateAsync(invitation),
  };
}
