/**
 * Hook for fetching available roles for member invitation.
 * @module use-roles-list
 */

import { useEffect, useRef, useState } from 'react';

import type {
  OrganizationRole,
  UseRolesListResult,
} from '@/types/my-organization/member-management/member-management-types';
import type { MemberManagementSdkClient } from '@/types/my-organization/member-management/member-management-types';

/**
 * Fetches the list of available roles from the SDK on mount.
 * Results are cached in a ref to avoid redundant fetches on dialog re-opens.
 *
 * @param sdkClient - Injected SDK client instance
 * @returns Roles list and loading state
 */
export function useRolesList(sdkClient: MemberManagementSdkClient): UseRolesListResult {
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<OrganizationRole[] | null>(null);

  useEffect(() => {
    if (cacheRef.current !== null) {
      setRoles(cacheRef.current);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    sdkClient.organization.members.roles
      .list()
      .then((result) => {
        if (!cancelled) {
          cacheRef.current = result;
          setRoles(result);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error('[useRolesList] Failed to fetch roles:', error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sdkClient]);

  return { roles, isLoading };
}
