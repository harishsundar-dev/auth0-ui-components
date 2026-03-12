import { useQuery } from '@tanstack/react-query';

import type {
  MemberRole,
  UseOrganizationRolesOptions,
} from '../../../types/my-organization/members-management/organization-members-manager-types';
import { useCoreClient } from '../../use-core-client';

const rolesQueryKeys = {
  all: ['organization-roles'] as const,
  list: () => [...rolesQueryKeys.all, 'list'] as const,
};

export interface UseOrganizationRolesResult {
  roles: MemberRole[];
  isLoading: boolean;
  error: Error | null;
}

export function useOrganizationRoles({
  enabled = true,
}: UseOrganizationRolesOptions = {}): UseOrganizationRolesResult {
  const { coreClient } = useCoreClient();

  const rolesQuery = useQuery({
    queryKey: rolesQueryKeys.list(),
    queryFn: async () => {
      const api = coreClient!.getMyOrganizationApiClient();
      const response = await (
        api.organization as unknown as {
          memberRoles: {
            list: () => Promise<{
              roles: MemberRole[];
            }>;
          };
        }
      ).memberRoles.list();

      return response?.roles ?? [];
    },
    enabled: !!coreClient && enabled,
  });

  return {
    roles: rolesQuery.data ?? [],
    isLoading: rolesQuery.isLoading,
    error: rolesQuery.error,
  };
}
