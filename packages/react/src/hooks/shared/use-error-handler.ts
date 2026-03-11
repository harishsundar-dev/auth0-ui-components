/**
 * Error handling hook with toast notifications.
 * @module use-error-handler
 */

import { isNotifiableError, resolveErrorMessage } from '@auth0/universal-components-core';
import { useCallback } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useTranslator } from '@/hooks/shared/use-translator';

interface ErrorHandlerCallOptions {
  fallbackMessage?: string;
}

/**
 * Hook for consistent error handling across the app.
 * Skips MFA/500+ errors (GateKeeper handles), shows toast for others.
 *
 * @returns Error handler function.
 *
 * @example
 * const handleError = useErrorHandler();
 *
 * // With custom message
 * onError: (error) => handleError(error, {
 *   fallbackMessage: t('my_error')
 * });
 *
 * // With defaults
 * onError: handleError;
 */
export function useErrorHandler() {
  const { t } = useTranslator('common');

  return useCallback(
    (error: unknown, options: ErrorHandlerCallOptions = {}): void => {
      if (!isNotifiableError(error)) return;

      showToast({
        type: 'error',
        message: resolveErrorMessage(error, options.fallbackMessage ?? t('error.generic')),
      });
    },
    [t],
  );
}
