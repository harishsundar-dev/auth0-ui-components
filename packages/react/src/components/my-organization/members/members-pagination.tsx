import type { MembersPagination as MembersPaginationState } from '../../../types/my-organization/members/members-list-types';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export interface MembersPaginationProps {
  pagination: MembersPaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  showingLabel: (start: number, end: number, total: number) => string;
  perPageLabel: string;
}

export function MembersPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  showingLabel,
  perPageLabel,
}: MembersPaginationProps) {
  const { page, perPage, total, totalPages } = pagination;

  if (total === 0) return null;

  const start = Math.min((page - 1) * perPage + 1, total);
  const end = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="text-sm text-muted-foreground">{showingLabel(start, end, total)}</div>
      <div className="flex items-center gap-2">
        <Select value={String(perPage)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="h-8 w-[110px]" aria-label="Page size">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} {perPageLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            ‹
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );
}
