import { useCallback, useEffect, useRef, useState } from 'react';

import type { OrganizationInvitation, OrganizationSDKClient } from '../MemberManagement.types';

export interface UseInvitationsListReturn {
  invitations: OrganizationInvitation[];
  isLoading: boolean;
  error: string | null;
  total: number;
  nextCursor: string | undefined;
  cursorStack: string[];
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  refetch: () => void;
}

/**
 *
 * @param client
 * @param pageSize
 * @param roleFilter
 */
export function useInvitationsList(
  client: OrganizationSDKClient,
  pageSize: number,
  roleFilter: string,
): UseInvitationsListReturn {
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [total, setTotal] = useState(0);

  const fetchInvitations = useCallback(
    async (cursor?: string, signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await client.organization.invitations.list({
          from: cursor,
          take: pageSize,
          role: roleFilter || undefined,
        });
        if (!signal?.aborted) {
          setInvitations(response.invitations ?? []);
          setNextCursor(response.next);
          setTotal(response.total ?? 0);
        }
      } catch {
        if (!signal?.aborted) {
          setError('Failed to fetch invitations');
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [client, pageSize, roleFilter],
  );

  useEffect(() => {
    const controller = new AbortController();
    setCursorStack([]);
    setCurrentCursor(undefined);
    void fetchInvitations(undefined, controller.signal);
    return () => controller.abort();
  }, [fetchInvitations]);

  const goToNextPage = useCallback(() => {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, currentCursor ?? '']);
    setCurrentCursor(nextCursor);
    const controller = new AbortController();
    void fetchInvitations(nextCursor, controller.signal);
  }, [nextCursor, currentCursor, fetchInvitations]);

  const goToPreviousPage = useCallback(() => {
    if (cursorStack.length === 0) return;
    const prev = [...cursorStack];
    const prevCursor = prev.pop();
    setCursorStack(prev);
    const cursor = prevCursor === '' ? undefined : prevCursor;
    setCurrentCursor(cursor);
    const controller = new AbortController();
    void fetchInvitations(cursor, controller.signal);
  }, [cursorStack, fetchInvitations]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    void fetchInvitations(currentCursor, controller.signal);
  }, [fetchInvitations, currentCursor]);

  return {
    invitations,
    isLoading,
    error,
    total,
    nextCursor,
    cursorStack,
    goToNextPage,
    goToPreviousPage,
    canGoNext: !!nextCursor,
    canGoPrevious: cursorStack.length > 0,
    refetch,
  };
}
