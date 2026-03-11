/**
 * My Organization API service initialization.
 * @module my-organization-api-service
 * @internal
 */

import { MyOrganizationClient } from '@auth0/myorganization-js';
import type { ClientAuthConfig } from '@core/auth/auth-types';
import { AuthUtils } from '@core/auth/auth-utils';

/**
 * Initializes the My Organization API client for organization, SSO, and domain operations.
 * @internal
 *
 * @param config - Auth configuration — either proxy or domain mode
 * @returns Object containing the client and scope setter function
 */
export function initializeMyOrganizationClient(config: ClientAuthConfig): {
  client: MyOrganizationClient;
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
      client: new MyOrganizationClient({
        domain: '',
        baseUrl: `${config.proxyUrl}/my-org`,
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
      'my-org',
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
    client: new MyOrganizationClient({
      domain: config.domain,
      fetcher,
    }),
    setLatestScopes,
  };
}
