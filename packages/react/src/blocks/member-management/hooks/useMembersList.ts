import { useCallback, useEffect, useState } from 'react';

import type { OrganizationMember, OrganizationSDKClient } from '../MemberManagement.types';

export interface UseMembersListReturn {
  members: OrganizationMember[];
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

export function useMembersList(
  client: OrganizationSDKClient,
  pageSize: number,
  searchQuery: string,
): UseMembersListReturn {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [total, setTotal] = useState(0);

  const fetchMembers = useCallback(
    async (cursor?: string, signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await client.organization.members.list({
          q: searchQuery || undefined,
          from: cursor,
          take: pageSize,
        });
        if (!signal?.aborted) {
          setMembers(response.members ?? []);
          setNextCursor(response.next);
          setTotal(response.total ?? 0);
        }
      } catch {
        if (!signal?.aborted) {
          setError('Failed to fetch members');
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [client, searchQuery, pageSize],
  );

  useEffect(() => {
    const controller = new AbortController();
    setCursorStack([]);
    setCurrentCursor(undefined);
    void fetchMembers(undefined, controller.signal);
    return () => controller.abort();
  }, [fetchMembers]);

  const goToNextPage = useCallback(() => {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, currentCursor ?? '']);
    setCurrentCursor(nextCursor);
    const controller = new AbortController();
    void fetchMembers(nextCursor, controller.signal);
  }, [nextCursor, currentCursor, fetchMembers]);

  const goToPreviousPage = useCallback(() => {
    if (cursorStack.length === 0) return;
    const prev = [...cursorStack];
    const prevCursor = prev.pop();
    setCursorStack(prev);
    const cursor = prevCursor === '' ? undefined : prevCursor;
    setCurrentCursor(cursor);
    const controller = new AbortController();
    void fetchMembers(cursor, controller.signal);
  }, [cursorStack, fetchMembers]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    void fetchMembers(currentCursor, controller.signal);
  }, [fetchMembers, currentCursor]);

  return {
    members,
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
