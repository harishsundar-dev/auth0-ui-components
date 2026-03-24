import { useCallback, useEffect, useRef, useState } from 'react';

import type { OrganizationMember, OrganizationRole, OrganizationSDKClient } from '../MemberManagement.types';

export interface UseMemberDetailReturn {
  member: OrganizationMember | null;
  roles: OrganizationRole[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 *
 * @param client
 * @param userId
 */
export function useMemberDetail(
  client: OrganizationSDKClient,
  userId: string | null,
): UseMemberDetailReturn {
  const [member, setMember] = useState<OrganizationMember | null>(null);
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) return;
      setIsLoading(true);
      setError(null);
      try {
        const [memberData, rolesData] = await Promise.all([
          client.organization.members.get(userId),
          client.organization.members.roles.list(userId),
        ]);
        if (!signal?.aborted) {
          setMember(memberData);
          setRoles(rolesData);
        }
      } catch {
        if (!signal?.aborted) {
          setError('Failed to fetch member details');
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [client, userId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchDetail(controller.signal);
    return () => controller.abort();
  }, [fetchDetail]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    void fetchDetail(controller.signal);
  }, [fetchDetail]);

  return { member, roles, isLoading, error, refetch };
}
