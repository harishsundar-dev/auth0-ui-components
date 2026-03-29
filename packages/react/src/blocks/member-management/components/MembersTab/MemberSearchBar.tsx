import { SearchIcon } from 'lucide-react';
import * as React from 'react';

import { defaultMessages } from '../../MemberManagement.i18n';

import { TextField } from '@/components/ui/text-field';


interface MemberSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 *
 * @param root0
 */
export function MemberSearchBar({ value, onChange }: MemberSearchBarProps): React.JSX.Element {
  return (
    <TextField
      type="search"
      placeholder={defaultMessages.members.searchPlaceholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      startAdornment={<SearchIcon className="size-4 text-muted-foreground" aria-hidden="true" />}
      aria-label={defaultMessages.members.searchPlaceholder}
      className="max-w-sm"
    />
  );
}
