import { FACTOR_TYPE_ALIASES, MFA_REQUIRED_ERROR } from './mfa-step-up-api-constants';
import type { MfaRequiredError } from './mfa-step-up-api-types';

/**
 * Type guard for Auth0 `mfa_required` errors (direct or nested under `body`).
 * @param error - The caught error value.
 * @returns Whether the error is an {@link MfaRequiredError}.
 */
export function isMfaRequiredError(error: unknown): error is MfaRequiredError {
  if (!error || typeof error !== 'object') return false;
  const isMfa = (obj: object) =>
    ('error' in obj && obj.error === MFA_REQUIRED_ERROR) ||
    ('code' in obj && obj.code === MFA_REQUIRED_ERROR);
  if (isMfa(error)) return true;
  const body = 'body' in error && typeof error.body === 'object' && error.body ? error.body : null;
  return !!body && isMfa(body);
}

/**
 * Flattens body-wrapped MFA errors to the standard {@link MfaRequiredError} shape.
 * @param error - The caught error value.
 * @returns A normalized {@link MfaRequiredError}.
 */
export function normalizeMfaRequiredError(error: unknown): MfaRequiredError {
  const err = error as Record<string, unknown>;
  const body =
    typeof err.body === 'object' && err.body ? (err.body as Record<string, unknown>) : undefined;
  return {
    ...err,
    mfa_token: err.mfa_token ?? body?.mfa_token,
    mfa_requirements: err.mfa_requirements ?? body?.mfa_requirements,
  } as MfaRequiredError;
}

/**
 * @param type - Raw factor type from the API.
 * @returns Canonical factor type (`phone` → `sms`, `push-notification` → `push`, `totp` → `otp`).
 */
export function normalizeFactorType(type: string): string {
  return FACTOR_TYPE_ALIASES[type] ?? type;
}
