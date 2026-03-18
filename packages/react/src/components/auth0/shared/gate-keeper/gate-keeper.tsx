/**
 * GateKeeper component for guarding content during loading, MFA step-up, and 5xx error states.
 * @module gate-keeper
 * @internal
 */

import {
  type ComponentStyling,
  getComponentStyles,
  getStatusCode,
  isMfaRequiredError,
} from '@auth0/universal-components-core';
import { RefreshCcw } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { useGateKeeperContext } from '@/providers/gate-keeper-context';

const GateKeeperViews = {
  LOADING: 'LOADING',
  MFA_CHALLENGE: 'MFA_CHALLENGE',
  ERROR_FALLBACK: 'ERROR_FALLBACK',
  SUCCESS: 'SUCCESS',
} as const;

type GateKeeperView = keyof typeof GateKeeperViews;

interface GateKeeperProps {
  styling?: ComponentStyling<Record<string, string>>;
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Blocking error fallback with retry button.
 * Shown for 5xx errors and dismissed MFA errors.
 *
 * @param props - Component props.
 * @param props.onRetry - Retry handler.
 * @param props.isRetrying - Whether a retry is in progress.
 * @returns Error fallback element.
 * @internal
 */
function ErrorFallback({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
  const { t } = useTranslator('gate_keeper');

  return (
    <Card className="text-center">
      <CardContent className="flex flex-col items-center gap-2">
        <CardTitle>{t('fallback.title')}</CardTitle>
        <CardDescription>{t('fallback.description')}</CardDescription>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="primary" size="default" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? (
            <Spinner size="sm" colorScheme="foreground" />
          ) : (
            <RefreshCcw className="size-4" />
          )}
          {t('fallback.retry')}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * MFA step-up dialog.
 *
 * @param props - Component props.
 * @param props.onClose - Callback when the dialog is dismissed.
 * @param props.onRetry - Callback to retry after MFA completion.
 * @returns MFA dialog element.
 * @internal
 */
function MfaDialog({ onClose, onRetry }: { onClose: () => void; onRetry: () => void }) {
  const { t } = useTranslator('gate_keeper');

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('mfa.title')}</DialogTitle>
          <DialogDescription>{t('mfa.subtitle')}</DialogDescription>
        </DialogHeader>
        {/* TODO: Replace with MFA challenge/enrollment flow */}
        <Button variant="primary" onClick={onRetry}>
          {t('fallback.retry')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Guards children from rendering during loading/error states.
 * - Loading → spinner
 * - MFA required error → MFA step-up dialog, then retries on completion
 * - 5xx error → blocking error fallback with retry
 * - No error → children
 *
 * @param props - Component props.
 * @param props.styling - Styling configuration forwarded to the styled scope.
 * @param props.isLoading - Whether content is loading.
 * @param props.children - Child elements to render on success.
 * @returns GateKeeper element.
 */
export function GateKeeper({ styling, isLoading, children }: GateKeeperProps) {
  const { error, onRetry } = useGateKeeperContext();
  const { isDarkMode } = useTheme();
  const [isRetrying, setIsRetrying] = useState(false);
  const [mfaInterrupted, setMfaInterrupted] = useState(false);

  const styles = useMemo(() => getComponentStyles(styling, isDarkMode), [styling, isDarkMode]);

  useEffect(() => setMfaInterrupted(false), [error]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setMfaInterrupted(false);
    try {
      await onRetry?.();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  const view = useMemo((): GateKeeperView => {
    if (isLoading || isRetrying) return GateKeeperViews.LOADING;

    const isMfaStepUp = isMfaRequiredError(error);
    const statusCode = getStatusCode(error);
    const isSystemError = !!error && !!statusCode && statusCode >= 500;

    if (isMfaStepUp && !mfaInterrupted) return GateKeeperViews.MFA_CHALLENGE;

    if (isSystemError || (isMfaStepUp && mfaInterrupted)) {
      return GateKeeperViews.ERROR_FALLBACK;
    }

    return GateKeeperViews.SUCCESS;
  }, [isLoading, isRetrying, error, mfaInterrupted]);

  return (
    <StyledScope style={styles.variables}>
      {view === GateKeeperViews.LOADING && (
        <div className="flex items-center justify-center p-8">
          <Spinner />
        </div>
      )}
      {view === GateKeeperViews.MFA_CHALLENGE && (
        <MfaDialog onClose={() => setMfaInterrupted(true)} onRetry={handleRetry} />
      )}
      {view === GateKeeperViews.ERROR_FALLBACK && (
        <ErrorFallback onRetry={handleRetry} isRetrying={isRetrying} />
      )}
      {view === GateKeeperViews.SUCCESS && children}
    </StyledScope>
  );
}
