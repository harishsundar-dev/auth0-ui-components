/**
 * Member detail data and role management hook.
 * @module use-member-detail
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { memberQueryKeys } from '@/hooks/my-organization/use-members-list';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  OrgMember,
  OrgMemberRole,
  UseMemberDetailReturn,
} from '@/types/my-organization/member-management';

export const memberDetailQueryKeys = {
  all: ['member-management'] as const,
  detail: (userId: string) => [...memberDetailQueryKeys.all, 'detail', userId] as const,
  roles: (userId: string) => [...memberDetailQueryKeys.all, 'roles', userId] as const,
};

/**
 * Hook for fetching a single member and managing their roles.
 *
 * Provides queries for the member profile and their assigned roles,
 * plus mutations to assign or remove individual roles.  Shows toast
 * notifications on success and delegates errors to `useErrorHandler`.
 *
 * @param userId - The user ID of the member to load.
 * @param customMessages - Optional i18n overrides.
 * @returns Member data, roles, loading state, and role mutation helpers.
 */
export function useMemberDetail(userId: string | null, customMessages = {}): UseMemberDetailReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages);
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const hasShownMemberError = useRef(false);
  const hasShownRolesError = useRef(false);

  // --- Queries ---

  const memberQuery = useQuery({
    queryKey: memberDetailQueryKeys.detail(userId!),
    queryFn: async () => {
      const apiClient = coreClient!.getMyOrganizationApiClient();
      const response = await apiClient.organization.members.get(userId!);
      return response as OrgMember;
    },
    enabled: !!coreClient && !!userId,
  });

  const rolesQuery = useQuery({
    queryKey: memberDetailQueryKeys.roles(userId!),
    queryFn: async () => {
      const apiClient = coreClient!.getMyOrganizationApiClient();
      const response = await apiClient.organization.members.roles.list(userId!);
      return (response?.roles ?? []) as OrgMemberRole[];
    },
    enabled: !!coreClient && !!userId,
  });

  // Show error toasts once per error
  useEffect(() => {
    if (memberQuery.isError && !hasShownMemberError.current) {
      handleError(memberQuery.error, { fallbackMessage: t('toasts.error_generic') });
      hasShownMemberError.current = true;
    }

    if (!memberQuery.isError) {
      hasShownMemberError.current = false;
    }
  }, [memberQuery.isError, memberQuery.error, t, handleError]);

  useEffect(() => {
    if (rolesQuery.isError && !hasShownRolesError.current) {
      handleError(rolesQuery.error, { fallbackMessage: t('toasts.error_generic') });
      hasShownRolesError.current = true;
    }

    if (!rolesQuery.isError) {
      hasShownRolesError.current = false;
    }
  }, [rolesQuery.isError, rolesQuery.error, t, handleError]);

  // --- Mutations ---

  const assignRoleMutation = useMutation({
    mutationFn: async (roleId: string): Promise<void> => {
      const apiClient = coreClient!.getMyOrganizationApiClient();
      await apiClient.organization.members.roles.create(userId!, { role_id: roleId });
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        message: t('toasts.role_assigned_success'),
      });

      queryClient.invalidateQueries({ queryKey: memberDetailQueryKeys.roles(userId!) });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.members() });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('toasts.error_generic') });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string): Promise<void> => {
      const apiClient = coreClient!.getMyOrganizationApiClient();
      await apiClient.organization.members.roles.delete(userId!, roleId);
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        message: t('toasts.role_removed_success'),
      });

      queryClient.invalidateQueries({ queryKey: memberDetailQueryKeys.roles(userId!) });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.members() });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('toasts.error_generic') });
    },
  });

  // --- Callbacks ---

  const assignRole = useCallback(
    async (roleId: string): Promise<void> => {
      if (!coreClient || !userId) {
        showToast({ type: 'error', message: t('toasts.error_generic') });
        return;
      }

      await assignRoleMutation.mutateAsync(roleId);
    },
    [coreClient, userId, assignRoleMutation],
  );

  const removeRole = useCallback(
    async (roleId: string): Promise<void> => {
      if (!coreClient || !userId) {
        showToast({ type: 'error', message: t('toasts.error_generic') });
        return;
      }

      await removeRoleMutation.mutateAsync(roleId);
    },
    [coreClient, userId, removeRoleMutation],
  );

  const refetchRoles = useCallback(() => {
    rolesQuery.refetch();
  }, [rolesQuery]);

  return {
    member: memberQuery.data ?? null,
    roles: rolesQuery.data ?? [],
    isLoading: memberQuery.isLoading || rolesQuery.isLoading,
    error: memberQuery.error ?? rolesQuery.error,
    assignRole,
    removeRole,
    refetchRoles,
  };
}
