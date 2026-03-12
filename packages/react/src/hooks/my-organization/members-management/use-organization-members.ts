import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { showToast } from '../../../components/ui/toast';
import type {
  OrganizationMember,
  MemberRole,
  UseOrganizationMembersOptions,
} from '../../../types/my-organization/members-management/organization-members-manager-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

const membersQueryKeys = {
  all: ['organization-members'] as const,
  list: (query?: string, roleFilter?: string) =>
    [...membersQueryKeys.all, 'list', query, roleFilter] as const,
};

export interface UseOrganizationMembersResult {
  members: OrganizationMember[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  roleFilter: string;
  search: (query: string) => void;
  filterByRole: (roleId: string) => void;
  removeMember: (userId: string, memberName: string) => Promise<void>;
  isRemoving: boolean;
  updateMemberRoles: (userId: string, memberName: string, roleIds: string[]) => Promise<void>;
  isUpdatingRoles: boolean;
  refetch: () => void;
}

export function useOrganizationMembers({
  customMessages = {},
}: UseOrganizationMembersOptions = {}): UseOrganizationMembersResult {
  const { t } = useTranslator(
    'members_management.organization_members_manager.notifications',
    customMessages,
  );
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const membersQuery = useQuery({
    queryKey: membersQueryKeys.list(searchQuery, roleFilter),
    queryFn: async () => {
      const api = coreClient!.getMyOrganizationApiClient();
      const response = await (
        api.organization as unknown as {
          members: {
            list: (params: { query?: string; role_id?: string }) => Promise<{
              members: Array<{
                user_id: string;
                email: string;
                name: string;
                picture?: string;
                roles: MemberRole[];
                last_login?: string;
                created_at: string;
              }>;
              total: number;
            }>;
          };
        }
      ).members.list({
        query: searchQuery || undefined,
        role_id: roleFilter || undefined,
      });

      const rawMembers = response?.members ?? [];
      return rawMembers.map(
        (m): OrganizationMember => ({
          userId: m.user_id,
          email: m.email,
          name: m.name,
          picture: m.picture,
          roles: m.roles ?? [],
          lastLogin: m.last_login,
          createdAt: m.created_at,
        }),
      );
    },
    enabled: !!coreClient,
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      await (
        coreClient!.getMyOrganizationApiClient().organization as unknown as {
          members: {
            delete: (params: { user_id: string }) => Promise<void>;
          };
        }
      ).members.delete({ user_id: userId });
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: membersQueryKeys.all });
      return userId;
    },
  });

  const removeMember = async (userId: string, memberName: string) => {
    try {
      await removeMutation.mutateAsync(userId);
      showToast({
        type: 'success',
        message: t('remove_success', { memberName }),
      });
    } catch {
      showToast({
        type: 'error',
        message: t('remove_error'),
      });
    }
  };

  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roleIds }: { userId: string; roleIds: string[] }) => {
      await (
        coreClient!.getMyOrganizationApiClient().organization as unknown as {
          memberRoles: {
            update: (params: { user_id: string; roles: Array<{ id: string }> }) => Promise<void>;
          };
        }
      ).memberRoles.update({ user_id: userId, roles: roleIds.map((id) => ({ id })) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersQueryKeys.all });
    },
  });

  const updateMemberRoles = async (userId: string, memberName: string, roleIds: string[]) => {
    try {
      await updateRolesMutation.mutateAsync({ userId, roleIds });
      showToast({
        type: 'success',
        message: t('update_roles_success', { memberName }),
      });
    } catch {
      showToast({
        type: 'error',
        message: t('update_roles_error'),
      });
    }
  };

  return {
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
    error: membersQuery.error,
    searchQuery,
    roleFilter,
    search: setSearchQuery,
    filterByRole: setRoleFilter,
    removeMember,
    isRemoving: removeMutation.isPending,
    updateMemberRoles,
    isUpdatingRoles: updateRolesMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: membersQueryKeys.all }),
  };
}
