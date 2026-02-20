'use client';

import * as React from 'react';

export const PortalContext = React.createContext<HTMLElement | null>(null);

export function usePortalContainer() {
  return React.useContext(PortalContext);
}
