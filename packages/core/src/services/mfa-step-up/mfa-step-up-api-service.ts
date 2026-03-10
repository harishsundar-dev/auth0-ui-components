import type { ClientAuthConfig, TokenEndpointResponse } from '../../auth/auth-types';

import type {
  Authenticator,
  ChallengeAuthenticatorParams,
  ChallengeResponse,
  EnrollmentResponse,
  EnrollParams,
  MfaApiClient,
  VerifyParams,
} from './mfa-step-up-api-types';

/**
 * Initializes an MFA API service based on auth configuration.
 *
 * @param auth - Auth details containing proxy URL or context interface.
 * @returns MFA API service instance.
 */
export function initializeMfaStepUpClient(auth: ClientAuthConfig): MfaApiClient {
  return auth.mode === 'proxy' ? createProxyMfaClient(auth.proxyUrl) : auth.contextInterface.mfa;
}

/**
 * @param authProxyUrl - Base URL for the auth proxy.
 * @returns Proxy-based MFA client.
 */
function createProxyMfaClient(authProxyUrl: string): MfaApiClient {
  const base = authProxyUrl.replace(/\/$/, '');

  const get = async <T>(path: string, query?: Record<string, string>): Promise<T> => {
    const qs = query ? `?${new URLSearchParams(query)}` : '';
    const res = await fetch(`${base}${path}${qs}`);
    if (!res.ok) throw await res.json().catch(() => ({ status: res.status }));
    return res.json();
  };

  const post = async <T>(path: string, body: unknown): Promise<T> => {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await res.json().catch(() => ({ status: res.status }));
    return res.json();
  };

  return {
    getAuthenticators: (mfaToken: string) =>
      get<Authenticator[]>('/auth/mfa/authenticators', { mfa_token: mfaToken }),

    enroll: (params: EnrollParams) =>
      post<EnrollmentResponse>('/auth/mfa/enroll', {
        mfaToken: params.mfaToken,
        authenticatorTypes: [params.factorType],
        ...('phoneNumber' in params && { phoneNumber: params.phoneNumber }),
        ...('email' in params && params.email && { email: params.email }),
      }),

    challenge: (params: ChallengeAuthenticatorParams) =>
      post<ChallengeResponse>('/auth/mfa/challenge', {
        mfaToken: params.mfaToken,
        challengeType: params.challengeType,
        authenticatorId: params.authenticatorId,
      }),

    verify: (params: VerifyParams) => post<TokenEndpointResponse>('/auth/mfa/verify', params),
  };
}
