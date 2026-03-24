import { useCallback, useState } from 'react';

const MAX_BULK_SELECTION = 50;

export interface UseBulkSelectionReturn {
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  isAllSelected: (ids: string[]) => boolean;
  isIndeterminate: (ids: string[]) => boolean;
}

export function useBulkSelection(): UseBulkSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_BULK_SELECTION) return prev;
      return [...prev, id];
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids.slice(0, MAX_BULK_SELECTION));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  const isAllSelected = useCallback(
    (ids: string[]) => ids.length > 0 && ids.every((id) => selectedIds.includes(id)),
    [selectedIds],
  );

  const isIndeterminate = useCallback(
    (ids: string[]) =>
      ids.some((id) => selectedIds.includes(id)) && !ids.every((id) => selectedIds.includes(id)),
    [selectedIds],
  );

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
  };
}
