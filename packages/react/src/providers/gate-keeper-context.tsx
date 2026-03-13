'use client';

/**
 * GateKeeper context for provider-level error interception.
 * @module gate-keeper-context
 * @internal
 */

import { createContext, useContext } from 'react';

/** GateKeeper context value — error state plus retry and clear callbacks. */
export interface GateKeeperContextValue {
  error: unknown;
  onRetry: () => Promise<boolean>;
  clearError: () => void;
}

const GATE_KEEPER_DEFAULT_CONTEXT: GateKeeperContextValue = {
  error: null,
  onRetry: () => {
    throw new Error('GateKeeperContext must be used within QueryProvider');
  },
  clearError: () => {
    throw new Error('GateKeeperContext must be used within QueryProvider');
  },
};

export const GateKeeperContext = createContext<GateKeeperContextValue>(GATE_KEEPER_DEFAULT_CONTEXT);

/**
 * @internal
 * @returns Current GateKeeper context value
 */
export function useGateKeeperContext(): GateKeeperContextValue {
  return useContext(GateKeeperContext);
}
