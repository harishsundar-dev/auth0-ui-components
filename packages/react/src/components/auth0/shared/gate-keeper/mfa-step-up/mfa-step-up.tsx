/**
 * MFA step-up orchestrator.
 * @module mfa-step-up
 * @internal
 */
import {
  normalizeFactorType,
  type EnrollmentFactor,
  type MfaAuthenticator,
  type MfaRequiredError,
} from '@auth0/universal-components-core';
import { useState } from 'react';

import { AuthenticatorsList } from './authenticators-list';
import { StepUpEnrollmentForm } from './step-up-enrollment-form';
import { StepUpVerifyForm } from './step-up-verify-form';

import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useTranslator } from '@/hooks/shared/use-translator';

type MfaStepUpState =
  | { view: 'list' }
  | { view: 'enroll'; factor: EnrollmentFactor }
  | { view: 'challenge'; authenticator: MfaAuthenticator };

interface MfaStepUpProps {
  error: MfaRequiredError;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * Orchestrates the MFA step-up flow: list → enroll or challenge → complete.
 *
 * @param props - Component props.
 * @param props.error - The MFA required error from the step-up flow.
 * @param props.onComplete - Called after successful challenge or enrollment.
 * @param props.onCancel - Called when the user cancels the flow.
 * @returns MFA step-up element.
 * @internal
 */
export function MfaStepUp({ error, onComplete, onCancel }: MfaStepUpProps) {
  const { t } = useTranslator('gate_keeper');
  const [state, setState] = useState<MfaStepUpState>({ view: 'list' });

  const handleSelectFactor = (factor: EnrollmentFactor) =>
    setState({ view: 'enroll', factor: { ...factor, type: normalizeFactorType(factor.type) } });

  const handleSelectAuthenticator = (authenticator: MfaAuthenticator) =>
    setState({ view: 'challenge', authenticator });

  if (state.view === 'enroll') {
    return (
      <StepUpEnrollmentForm
        error={error}
        factor={state.factor}
        onComplete={onComplete}
        onCancel={() => setState({ view: 'list' })}
      />
    );
  }

  if (state.view === 'challenge') {
    return (
      <StepUpVerifyForm
        error={error}
        authenticator={state.authenticator}
        onComplete={onComplete}
        onCancel={() => setState({ view: 'list' })}
      />
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('mfa.title')}</DialogTitle>
        <DialogDescription>{t('mfa.subtitle')}</DialogDescription>
      </DialogHeader>
      <Separator />
      <AuthenticatorsList
        error={error}
        onSelectFactor={handleSelectFactor}
        onSelectAuthenticator={handleSelectAuthenticator}
        onCancel={onCancel}
      />
    </>
  );
}
