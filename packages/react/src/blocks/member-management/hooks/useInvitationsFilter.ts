import { useEffect, useState } from 'react';

import type { OrganizationRole, OrganizationSDKClient } from '../MemberManagement.types';

export interface UseInvitationsFilterReturn {
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  availableRoles: OrganizationRole[];
  isLoadingRoles: boolean;
}

export function useInvitationsFilter(client: OrganizationSDKClient): UseInvitationsFilterReturn {
  const [roleFilter, setRoleFilter] = useState('');
  const [availableRoles, setAvailableRoles] = useState<OrganizationRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingRoles(true);
    client.organization.roles
      .list()
      .then((roles) => {
        if (!controller.signal.aborted) {
          setAvailableRoles(roles);
        }
      })
      .catch(() => {
        // silent fail for roles filter
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingRoles(false);
        }
      });
    return () => controller.abort();
  }, [client]);

  return { roleFilter, setRoleFilter, availableRoles, isLoadingRoles };
}
