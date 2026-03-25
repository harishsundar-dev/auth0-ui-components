/**
 * Members list data hook with search, filtering, and pagination.
 * @module use-members-list
 */

import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrgMember, UseMembersListReturn } from '@/types/my-organization/member-management';

const DEBOUNCE_MS = 300;
const DEFAULT_PER_PAGE = 10;

export const memberQueryKeys = {
  all: ['member-management'] as const,
  members: () => [...memberQueryKeys.all, 'members'] as const,
  list: (params: { q: string; from: string | null; take: number; roleFilter: string }) =>
    [...memberQueryKeys.members(), params] as const,
};

/**
 * Hook for fetching and paginating organization members.
 *
 * Supports debounced text search (`q`), client-side role filtering,
 * and cursor-based pagination using the `from` / `take` pattern exposed
 * by the Management API.
 *
 * @param customMessages - Optional i18n overrides.
 * @returns Members data, search/filter state, and pagination controls.
 */
export function useMembersList(customMessages = {}): UseMembersListReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages);
  const handleError = useErrorHandler();
  const hasShownError = useRef(false);

  // Search state with debounce
  const [searchQuery, setSearchQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Role filter (client-side)
  const [roleFilter, setRoleFilterState] = useState('');

  // Pagination state
  const [perPage, setPerPageState] = useState(DEFAULT_PER_PAGE);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
      // Reset pagination when search changes
      setCursorStack([]);
      setCurrentCursor(null);
      setPage(1);
    }, DEBOUNCE_MS);
  }, []);

  const setRoleFilter = useCallback((role: string) => {
    setRoleFilterState(role);
    // Reset pagination when filter changes
    setCursorStack([]);
    setCurrentCursor(null);
    setPage(1);
  }, []);

  const setPerPage = useCallback((newPerPage: number) => {
    setPerPageState(newPerPage);
    setCursorStack([]);
    setCurrentCursor(null);
    setPage(1);
  }, []);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const membersQuery = useQuery({
    queryKey: memberQueryKeys.list({
      q: debouncedQuery,
      from: currentCursor,
      take: perPage,
      roleFilter,
    }),
    queryFn: async () => {
      const apiClient = coreClient!.getMyOrganizationApiClient();

      const response = await apiClient.organization.members.list({
        q: debouncedQuery || null,
        from: currentCursor,
        take: perPage,
      });

      return (response?.members ?? []) as OrgMember[];
    },
    enabled: !!coreClient,
  });

  // Show error toast once per error
  useEffect(() => {
    if (membersQuery.isError && !hasShownError.current) {
      handleError(membersQuery.error, { fallbackMessage: t('toasts.error_generic') });
      hasShownError.current = true;
    }

    if (!membersQuery.isError) {
      hasShownError.current = false;
    }
  }, [membersQuery.isError, membersQuery.error, t, handleError]);

  // Apply client-side role filter
  const filteredMembers =
    roleFilter && membersQuery.data
      ? membersQuery.data.filter((member) =>
          member.roles?.some((role) => role.id === roleFilter || role.name === roleFilter),
        )
      : (membersQuery.data ?? []);

  // Determine if the server returned a full page (hint for next page)
  const hasNextPage = (membersQuery.data?.length ?? 0) >= perPage;
  const hasPreviousPage = cursorStack.length > 0;

  // The last member's user_id serves as the cursor for the next page
  const lastMember = membersQuery.data?.[membersQuery.data.length - 1];
  const nextCursor = lastMember?.user_id ?? null;

  const totalPages = hasNextPage ? page + 1 : page;

  const goToNextPage = useCallback(() => {
    if (!hasNextPage || !nextCursor) return;
    setCursorStack((prev) => [...prev, currentCursor ?? '']);
    setCurrentCursor(nextCursor);
    setPage((prev) => prev + 1);
  }, [hasNextPage, nextCursor, currentCursor]);

  const goToPreviousPage = useCallback(() => {
    if (!hasPreviousPage) return;
    setCursorStack((prev) => {
      const stack = [...prev];
      const previousCursor = stack.pop();
      setCurrentCursor(previousCursor === '' ? null : (previousCursor ?? null));
      return stack;
    });
    setPage((prev) => Math.max(1, prev - 1));
  }, [hasPreviousPage]);

  const refetch = useCallback(() => {
    membersQuery.refetch();
  }, [membersQuery]);

  return {
    members: filteredMembers,
    isLoading: membersQuery.isLoading,
    error: membersQuery.error,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    perPage,
    setPerPage,
    refetch,
  };
}
