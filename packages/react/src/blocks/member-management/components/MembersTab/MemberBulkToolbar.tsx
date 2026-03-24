import * as React from 'react';

import { defaultMessages } from '../../MemberManagement.i18n';

import { Button } from '@/components/ui/button';


interface MemberBulkToolbarProps {
  selectedCount: number;
  onRemove: () => void;
  onDelete: () => void;
  onClear: () => void;
}

/**
 *
 * @param root0
 */
export function MemberBulkToolbar({
  selectedCount,
  onRemove,
  onDelete,
  onClear,
}: MemberBulkToolbarProps): React.JSX.Element | null {
  if (selectedCount === 0) return null;

  const msgs = defaultMessages.members;
  const selectedLabel = msgs.selected.replace('{count}', String(selectedCount));

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border"
    >
      <span className="text-sm font-medium text-muted-foreground flex-1">{selectedLabel}</span>
      <Button variant="outline" size="sm" onClick={onClear}>
        Clear
      </Button>
      <Button variant="outline" size="sm" onClick={onRemove}>
        {msgs.bulkRemove}
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete}>
        {msgs.bulkDelete}
      </Button>
    </div>
  );
}
