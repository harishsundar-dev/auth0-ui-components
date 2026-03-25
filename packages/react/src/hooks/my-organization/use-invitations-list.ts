/**
 * Invitations list data hook with pagination.
 * @module use-invitations-list
 */

import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  MemberInvitation,
  UseInvitationsListReturn,
} from '@/types/my-organization/member-management';

const DEFAULT_PER_PAGE = 10;

export const invitationQueryKeys = {
  all: ['member-management'] as const,
  invitations: () => [...invitationQueryKeys.all, 'invitations'] as const,
  list: (params: { from: string | null; take: number }) =>
    [...invitationQueryKeys.invitations(), params] as const,
};

/**
 * Hook for fetching and paginating organization invitations.
 *
 * Uses cursor-based pagination via the `from` / `take` parameters
 * exposed by the Management API.
 *
 * @param customMessages - Optional i18n overrides.
 * @returns Invitations data and pagination controls.
 */
export function useInvitationsList(customMessages = {}): UseInvitationsListReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages);
  const handleError = useErrorHandler();
  const hasShownError = useRef(false);

  // Pagination state
  const [perPage, setPerPageState] = useState(DEFAULT_PER_PAGE);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const setPerPage = useCallback((newPerPage: number) => {
    setPerPageState(newPerPage);
    setCursorStack([]);
    setCurrentCursor(null);
    setPage(1);
  }, []);

  const invitationsQuery = useQuery({
    queryKey: invitationQueryKeys.list({
      from: currentCursor,
      take: perPage,
    }),
    queryFn: async () => {
      const apiClient = coreClient!.getMyOrganizationApiClient();

      const response = await apiClient.organization.invitations.list({
        from: currentCursor,
        take: perPage,
        sort: 'created_at:-1',
      });

      return (response?.invitations ?? []) as MemberInvitation[];
    },
    enabled: !!coreClient,
  });

  // Show error toast once per error
  useEffect(() => {
    if (invitationsQuery.isError && !hasShownError.current) {
      handleError(invitationsQuery.error, { fallbackMessage: t('toasts.error_generic') });
      hasShownError.current = true;
    }

    if (!invitationsQuery.isError) {
      hasShownError.current = false;
    }
  }, [invitationsQuery.isError, invitationsQuery.error, t, handleError]);

  // Determine if the server returned a full page (hint for next page)
  const invitations = invitationsQuery.data ?? [];
  const hasNextPage = invitations.length >= perPage;
  const hasPreviousPage = cursorStack.length > 0;

  // The last invitation's id serves as the cursor for the next page
  const lastInvitation = invitations[invitations.length - 1];
  const nextCursor = lastInvitation?.id ?? null;

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
    invitationsQuery.refetch();
  }, [invitationsQuery]);

  return {
    invitations,
    isLoading: invitationsQuery.isLoading,
    error: invitationsQuery.error,
    page,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    perPage,
    setPerPage,
    refetch,
  };
}
