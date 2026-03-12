import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../../components/ui/toast';
import type {
  MemberInvitation,
  MemberRole,
  UseOrganizationInvitationsOptions,
} from '../../../types/my-organization/members-management/organization-members-manager-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

const invitationsQueryKeys = {
  all: ['organization-invitations'] as const,
  list: () => [...invitationsQueryKeys.all, 'list'] as const,
};

export interface UseOrganizationInvitationsResult {
  invitations: MemberInvitation[];
  isLoading: boolean;
  error: Error | null;
  deleteInvitation: (invitationId: string, email: string) => Promise<void>;
  isDeleting: boolean;
  refetch: () => void;
}

export function useOrganizationInvitations({
  customMessages = {},
}: UseOrganizationInvitationsOptions = {}): UseOrganizationInvitationsResult {
  const { t } = useTranslator(
    'members_management.organization_members_manager.notifications',
    customMessages,
  );
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: invitationsQueryKeys.list(),
    queryFn: async () => {
      const api = coreClient!.getMyOrganizationApiClient();
      const response = await (
        api.organization as unknown as {
          memberInvitations: {
            list: () => Promise<{
              invitations: Array<{
                id: string;
                invitee: { email: string };
                roles: MemberRole[];
                inviter: { name: string };
                created_at: string;
                expires_at: string;
                status: string;
              }>;
            }>;
          };
        }
      ).memberInvitations.list();

      const rawInvitations = response?.invitations ?? [];
      return rawInvitations.map(
        (inv): MemberInvitation => ({
          id: inv.id,
          inviteeEmail: inv.invitee?.email ?? '',
          roles: inv.roles ?? [],
          invitedBy: inv.inviter?.name ?? '',
          createdAt: inv.created_at,
          expiresAt: inv.expires_at,
          status: (inv.status as MemberInvitation['status']) ?? 'pending',
        }),
      );
    },
    enabled: !!coreClient,
  });

  const deleteMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      await (
        coreClient!.getMyOrganizationApiClient().organization as unknown as {
          memberInvitations: {
            delete: (invitationId: string) => Promise<void>;
          };
        }
      ).memberInvitations.delete(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationsQueryKeys.all });
    },
  });

  const deleteInvitation = async (invitationId: string, email: string) => {
    try {
      await deleteMutation.mutateAsync(invitationId);
      showToast({
        type: 'success',
        message: t('delete_invitation_success'),
      });
    } catch {
      showToast({
        type: 'error',
        message: t('delete_invitation_error'),
      });
    }
    void email;
  };

  return {
    invitations: invitationsQuery.data ?? [],
    isLoading: invitationsQuery.isLoading,
    error: invitationsQuery.error,
    deleteInvitation,
    isDeleting: deleteMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: invitationsQueryKeys.all }),
  };
}
