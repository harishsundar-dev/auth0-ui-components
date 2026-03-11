/**
 * My Account API service initialization.
 * @module my-account-api-service
 * @internal
 */

import { MyAccountClient } from '@auth0/myaccount-js';

import type { ClientAuthConfig } from '../../auth/auth-types';
import { AuthUtils } from '../../auth/auth-utils';

/**
 * Initializes the My Account API client for MFA and user profile operations.
 * @internal
 *
 * @param config - Auth configuration — either proxy or domain mode
 * @returns Object containing the client and scope setter function
 */
export function initializeMyAccountClient(config: ClientAuthConfig): {
  client: MyAccountClient;
  setLatestScopes: (scopes: string) => void;
} {
  let latestScopes = '';

  const setLatestScopes = (scopes: string) => {
    latestScopes = scopes;
  };

  if (config.mode === 'proxy') {
    const fetcher = async (url: string, init?: RequestInit) => {
      return fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          ...(init?.body && { 'Content-Type': 'application/json' }),
          ...(latestScopes && { 'auth0-scope': latestScopes }),
        },
      });
    };
    return {
      client: new MyAccountClient({
        domain: '',
        baseUrl: `${config.proxyUrl}/me`,
        telemetry: false,
        fetcher,
      }),
      setLatestScopes,
    };
  }

  const fetcher = async (url: string, init?: RequestInit) => {
    const token = await AuthUtils.getToken(
      config.contextInterface,
      config.domain,
      'me',
      latestScopes,
    );

    const headers = new Headers(init?.headers);
    if (init?.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Authorization', `Bearer ${token}`);

    return fetch(url, { ...init, headers });
  };
  return {
    client: new MyAccountClient({
      domain: config.domain,
      fetcher,
    }),
    setLatestScopes,
  };
}
