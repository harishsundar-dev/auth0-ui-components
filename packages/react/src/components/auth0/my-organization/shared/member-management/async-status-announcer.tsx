/**
 * Async status announcer for screen reader live region.
 * @module async-status-announcer
 * @internal
 */

import * as React from 'react';

interface AsyncStatusAnnouncerProps {
  message: string | null;
}

/**
 * Renders an aria-live polite region that announces async state changes to screen readers.
 * @param props - Component props
 * @returns Aria-live region element
 * @internal
 */
export function AsyncStatusAnnouncer({ message }: AsyncStatusAnnouncerProps): React.JSX.Element {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message ?? ''}
    </div>
  );
}
