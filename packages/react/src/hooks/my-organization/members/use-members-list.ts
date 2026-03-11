import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { showToast } from '../../../components/ui/toast';
import type {
  MemberRole,
  OrganizationMember,
  MembersPagination,
  MembersFilter,
  UseMembersListReturn,
  UseMembersListOptions,
} from '../../../types/my-organization/members/members-list-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

/**
 * Interface describing the members and roles API shape expected from the organization client.
 *
 * The `@auth0/myorganization-js` SDK does not yet expose `members` or `roles` resources on its
 * `organization` sub-client. The type cast (`as unknown as MembersClientExtension`) in the query
 * functions below is therefore intentional: it forward-declares the API shape that the SDK will
 * provide once member management endpoints are added. Remove the cast and this interface when the
 * SDK is updated to include these methods.
 */
interface MembersClientExtension {
  organization: {
    members: {
      list: (params: {
        page?: number;
        per_page?: number;
        search?: string;
        role_id?: string;
      }) => Promise<{ members: OrganizationMember[]; total: number; next?: string }>;
      remove: (userId: string) => Promise<void>;
    };
    roles: {
      list: () => Promise<{ roles: MemberRole[] }>;
    };
  };
}

const membersQueryKeys = {
  all: ['organization', 'members'] as const,
  list: (params: object) => [...membersQueryKeys.all, 'list', params] as const,
  roles: ['organization', 'roles'] as const,
};

/**
 * Composite hook for the MembersList block.
 * Combines members query, roles query, and local state management.
 */
export function useMembersList(options: UseMembersListOptions = {}): UseMembersListReturn {
  const { defaultPageSize = 10 } = options;
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();
  const { t } = useTranslator('organization_management.members_list');

  // Pagination state
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);

  // Filter state
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string | null>(null);

  // Selection state
  const [selectedMembers, setSelectedMembers] = React.useState<Set<string>>(new Set());

  // Debounced search to avoid excessive API calls
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    setPage(1);
  }, [roleFilter]);

  const queryParams = React.useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: debouncedSearch || undefined,
      roleId: roleFilter ?? undefined,
    }),
    [page, pageSize, debouncedSearch, roleFilter],
  );

  const membersQuery = useQuery({
    queryKey: membersQueryKeys.list(queryParams),
    queryFn: async () => {
      const client = coreClient!.getMyOrganizationApiClient() as unknown as MembersClientExtension;
      const params: {
        page?: number;
        per_page?: number;
        search?: string;
        role_id?: string;
      } = {
        page: queryParams.page,
        per_page: queryParams.perPage,
      };

      if (queryParams.search) {
        params.search = queryParams.search;
      }

      if (queryParams.roleId) {
        params.role_id = queryParams.roleId;
      }

      const response = await client.organization.members.list(params);
      return response;
    },
    enabled: !!coreClient,
    staleTime: 30_000,
  });

  const rolesQuery = useQuery({
    queryKey: membersQueryKeys.roles,
    queryFn: async () => {
      const client = coreClient!.getMyOrganizationApiClient() as unknown as MembersClientExtension;
      const response = await client.organization.roles.list();
      return response.roles;
    },
    enabled: !!coreClient,
    staleTime: 5 * 60_000,
  });

  React.useEffect(() => {
    if (membersQuery.error) {
      showToast({ type: 'error', message: t('errors.load_failed') });
    }
  }, [membersQuery.error, t]);

  const removeMembersMutation = useMutation({
    mutationFn: async (memberIds: string[]) => {
      const client = coreClient!.getMyOrganizationApiClient() as unknown as MembersClientExtension;
      const results = await Promise.allSettled(
        memberIds.map((id) => client.organization.members.remove(id)),
      );

      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(t('errors.remove_failed'));
      }

      return memberIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersQueryKeys.all });
    },
    onError: () => {
      showToast({ type: 'error', message: t('errors.remove_failed') });
    },
  });

  const members: OrganizationMember[] = React.useMemo(
    () =>
      (membersQuery.data?.members ?? []).map((m) => ({
        ...m,
        roles: m.roles ?? [],
      })),
    [membersQuery.data],
  );
  const total = membersQuery.data?.total ?? 0;
  const roles: MemberRole[] = rolesQuery.data ?? [];

  const pagination: MembersPagination = React.useMemo(
    () => ({
      page,
      perPage: pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }),
    [page, pageSize, total],
  );

  const filters: MembersFilter = React.useMemo(
    () => ({
      search,
      roleId: roleFilter,
    }),
    [search, roleFilter],
  );

  const computed = React.useMemo(() => {
    const memberIds = new Set(members.map((m) => m.user_id));
    const selectedOnPage = [...selectedMembers].filter((id) => memberIds.has(id));

    return {
      isAllSelected: members.length > 0 && selectedOnPage.length === members.length,
      isSomeSelected: selectedOnPage.length > 0 && selectedOnPage.length < members.length,
      selectedCount: selectedMembers.size,
      hasFilters: Boolean(search || roleFilter),
    };
  }, [members, selectedMembers, search, roleFilter]);

  const actions = React.useMemo(
    () => ({
      setPage,
      setPageSize: (size: number) => {
        setPageSize(size);
        setPage(1);
      },
      setSearch,
      setRoleFilter,
      resetFilters: () => {
        setSearch('');
        setRoleFilter(null);
        setPage(1);
      },
      selectMember: (memberId: string) => {
        setSelectedMembers((prev) => new Set([...prev, memberId]));
      },
      deselectMember: (memberId: string) => {
        setSelectedMembers((prev) => {
          const next = new Set(prev);
          next.delete(memberId);
          return next;
        });
      },
      selectAll: () => {
        setSelectedMembers((prev) => {
          const next = new Set(prev);
          members.forEach((m) => next.add(m.user_id));
          return next;
        });
      },
      deselectAll: () => {
        setSelectedMembers(new Set());
      },
      toggleMember: (memberId: string) => {
        setSelectedMembers((prev) => {
          const next = new Set(prev);
          if (next.has(memberId)) {
            next.delete(memberId);
          } else {
            next.add(memberId);
          }
          return next;
        });
      },
      removeMembers: async (memberIds: string[]) => {
        await removeMembersMutation.mutateAsync(memberIds);
        setSelectedMembers((prev) => {
          const next = new Set(prev);
          memberIds.forEach((id) => next.delete(id));
          return next;
        });
      },
    }),
    [members, removeMembersMutation],
  );

  return {
    members,
    roles,
    isLoading:
      !coreClient ||
      membersQuery.isLoading ||
      rolesQuery.isLoading ||
      removeMembersMutation.isPending,
    error: (membersQuery.error ?? rolesQuery.error ?? null) as Error | null,
    pagination,
    filters,
    selectedMembers,
    actions,
    computed,
  };
}
