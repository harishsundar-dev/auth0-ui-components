/**
 * OAuth scope manager context and hook.
 * @module use-scope-manager
 */

import { createContext, useContext } from 'react';

/** API audience type. */
export type Audience = 'me' | 'my-org';

/** Scope manager context value. */
export interface ScopeManagerContextValue {
  registerScopes: (audience: Audience, scopes: string) => void;
  isReady: boolean;
  ensured: Record<Audience, string>;
}

/** @internal */
export const ScopeManagerContext = createContext<ScopeManagerContextValue>({
  registerScopes: () => {},
  isReady: false,
  ensured: { me: '', 'my-org': '' },
});

/**
 * Hook to access scope manager context.
 * @returns Scope manager context value.
 */
export const useScopeManager = () => useContext(ScopeManagerContext);
