import { useQuery } from '@tanstack/react-query';

import type { UseOrganizationRolesReturn } from '../../../types/my-organization/member-management/invite-member-types';
import { useCoreClient } from '../../use-core-client';

/**
 * Query key for organization roles
 */
export const ORGANIZATION_ROLES_QUERY_KEY = 'organization-roles';

/**
 * Hook for fetching available roles in an organization
 * @param organizationId - The organization ID
 * @returns Organization roles query result
 */
export function useOrganizationRoles(organizationId: string): UseOrganizationRolesReturn {
  const { coreClient } = useCoreClient();

  const rolesQuery = useQuery({
    queryKey: [ORGANIZATION_ROLES_QUERY_KEY, organizationId],
    queryFn: async () => {
      const api = coreClient!.getMyOrganizationApiClient();
      const response = await api.organization.roles.list();
      return response?.roles ?? [];
    },
    enabled: !!coreClient && !!organizationId,
  });

  return {
    roles: rolesQuery.data ?? [],
    isLoading: rolesQuery.isLoading,
    error: rolesQuery.error as Error | null,
    refetch: rolesQuery.refetch,
  };
}
