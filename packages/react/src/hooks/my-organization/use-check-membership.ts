/**
 * Hook for checking whether an email is already a member of the organization.
 * @module use-check-membership
 */

import { useCallback } from 'react';

import type {
  UseCheckMembershipOptions,
  UseCheckMembershipResult,
} from '@/types/my-organization/member-management/member-management-types';

/**
 * Provides a lazy membership check function.
 * Called only on form submission — not on every keystroke.
 *
 * @param options - Hook options
 * @param options.sdkClient - Injected SDK client instance
 * @returns Object with checkMembership function
 */
export function useCheckMembership({
  sdkClient,
}: UseCheckMembershipOptions): UseCheckMembershipResult {
  const checkMembership = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        const result = await sdkClient.organization.members.list({ q: email });
        return result.total > 0;
      } catch (error: unknown) {
        console.error('[useCheckMembership] Failed to check membership:', error);
        return false;
      }
    },
    [sdkClient],
  );

  return { checkMembership };
}
