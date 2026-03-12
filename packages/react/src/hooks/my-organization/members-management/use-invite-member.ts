import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../../components/ui/toast';
import type {
  MemberInvitation,
  MemberRole,
  SingleInviteFormValues,
  BulkInviteFormValues,
  UseInviteMemberOptions,
} from '../../../types/my-organization/members-management/organization-members-manager-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

const invitationsQueryKeys = {
  all: ['organization-invitations'] as const,
};

type MemberInvitationsApi = {
  memberInvitations: {
    create: (params: { invitee: { email: string }; roles: Array<{ id: string }> }) => Promise<{
      id: string;
      invitee: { email: string };
      roles: MemberRole[];
      inviter: { name: string };
      created_at: string;
      expires_at: string;
      status: string;
    }>;
  };
};

export interface UseInviteMemberResult {
  inviteSingle: (values: SingleInviteFormValues) => Promise<MemberInvitation | null>;
  inviteBulk: (values: BulkInviteFormValues) => Promise<void>;
  isInviting: boolean;
  error: Error | null;
  reset: () => void;
}

export function useInviteMember({
  onSuccess,
  customMessages = {},
}: UseInviteMemberOptions = {}): UseInviteMemberResult {
  const { t } = useTranslator(
    'members_management.organization_members_manager.notifications',
    customMessages,
  );
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: async ({
      email,
      roleIds,
    }: {
      email: string;
      roleIds: string[];
    }): Promise<MemberInvitation> => {
      const api = coreClient!.getMyOrganizationApiClient();
      const raw = await (
        api.organization as unknown as MemberInvitationsApi
      ).memberInvitations.create({
        invitee: { email },
        roles: roleIds.map((id) => ({ id })),
      });

      return {
        id: raw.id,
        inviteeEmail: raw.invitee?.email ?? email,
        roles: raw.roles ?? [],
        invitedBy: raw.inviter?.name ?? '',
        createdAt: raw.created_at,
        expiresAt: raw.expires_at,
        status: (raw.status as MemberInvitation['status']) ?? 'pending',
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationsQueryKeys.all });
    },
  });

  const inviteSingle = async (values: SingleInviteFormValues): Promise<MemberInvitation | null> => {
    try {
      const invitation = await inviteMutation.mutateAsync({
        email: values.email,
        roleIds: values.roleIds,
      });
      showToast({
        type: 'success',
        message: t('invite_success', { email: values.email }),
      });
      onSuccess?.(invitation);
      return invitation;
    } catch {
      showToast({
        type: 'error',
        message: t('invite_error'),
      });
      return null;
    }
  };

  const inviteBulk = async (values: BulkInviteFormValues): Promise<void> => {
    const emails = values.emails
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    const results = await Promise.allSettled(
      emails.map((email) => inviteMutation.mutateAsync({ email, roleIds: values.roleIds })),
    );

    const failedCount = results.filter((r) => r.status === 'rejected').length;
    if (failedCount === 0) {
      showToast({ type: 'success', message: t('bulk_invite_success') });
    } else if (failedCount < emails.length) {
      showToast({
        type: 'error',
        message: t('bulk_invite_partial_success', { failedCount: String(failedCount) }),
      });
    } else {
      showToast({ type: 'error', message: t('invite_error') });
    }
  };

  return {
    inviteSingle,
    inviteBulk,
    isInviting: inviteMutation.isPending,
    error: inviteMutation.error,
    reset: inviteMutation.reset,
  };
}
