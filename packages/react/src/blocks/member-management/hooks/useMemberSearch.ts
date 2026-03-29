import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseMemberSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedQuery: string;
}

/**
 *
 * @param debounceMs
 */
export function useMemberSearch(debounceMs = 300): UseMemberSearchReturn {
  const [searchQuery, setSearchQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryState(query);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDebouncedQuery(query);
      }, debounceMs);
    },
    [debounceMs],
  );

  return { searchQuery, setSearchQuery, debouncedQuery };
}
