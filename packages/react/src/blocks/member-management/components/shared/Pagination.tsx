import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { defaultMessages } from '../../MemberManagement.i18n';

interface PaginationProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  total: number;
  currentCount: number;
}

const PAGE_SIZES = [10, 25, 50, 100];

export function Pagination({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  pageSize,
  onPageSizeChange,
  total,
  currentCount,
}: PaginationProps): React.JSX.Element {
  const msgs = defaultMessages.pagination;

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{msgs.pageSize}:</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-[70px]" aria-label="Page size">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {total > 0 && (
          <span>
            {msgs.showing.replace('{count}', String(currentCount))}
            {` of ${total}`}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          aria-label={msgs.previous}
        >
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
          {msgs.previous}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label={msgs.next}
        >
          {msgs.next}
          <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
