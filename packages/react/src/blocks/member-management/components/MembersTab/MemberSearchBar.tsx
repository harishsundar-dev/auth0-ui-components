import { SearchIcon } from 'lucide-react';
import * as React from 'react';

import { TextField } from '@/components/ui/text-field';

import { defaultMessages } from '../../MemberManagement.i18n';

interface MemberSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

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
