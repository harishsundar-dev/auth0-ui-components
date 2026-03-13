/**
 * API client builders for Auth0 SDK clients.
 * @module api-clients
 * @internal
 */

import { MyAccountClient } from '@auth0/myaccount-js';
import { MyOrganizationClient } from '@auth0/myorganization-js';

import type { ClientAuthConfig, FetcherSupplier, SpaAuthConfig } from '../auth/auth-types';

export const AUTH0_SCOPE_HEADER = 'auth0-scope';

export const MY_ACCOUNT_PROXY_PATH = 'me';
export const MY_ACCOUNT_DPOP_NONCE_ID = '__auth0_my_account_api__';

export const MY_ORGANIZATION_PROXY_PATH = 'my-org';
export const MY_ORGANIZATION_DPOP_NONCE_ID = '__auth0_my_organization_api__';

/**
 * Creates a fetcher function for proxy mode that injects scopes via auth0-scope header.
 * The proxy will extract scopes from the header and request the appropriate token.
 * @returns Fetcher function that sets auth0-scope header
 * @internal
 */
function createProxyFetcher(): FetcherSupplier {
  return async (url, init, authParams) => {
    const headers = new Headers(init?.headers);
    if (authParams?.scope?.length) {
      headers.set(AUTH0_SCOPE_HEADER, authParams.scope.join(' '));
    }
    return fetch(url, { ...init, headers });
  };
}

/**
 * Creates a fetcher function for SPA mode using Auth0 SDK's createFetcher.
 * @param config - SPA auth configuration with context interface
 * @param dpopNonceId - Unique identifier for DPoP nonce management
 * @returns Fetcher function that delegates to SDK's fetchWithAuth
 * @internal
 */
function createSpaFetcher(config: SpaAuthConfig, dpopNonceId: string): FetcherSupplier {
  const sdkFetcher = config.contextInterface.createFetcher!({ dpopNonceId });
  return (url, init, authParams) =>
    sdkFetcher.fetchWithAuth(url, init, {
      scope: authParams?.scope,
      audience: authParams?.audience,
    });
}

/**
 * Creates a MyAccountClient configured for the given auth mode.
 * @param config - Auth configuration (proxy or SPA mode)
 * @returns Configured MyAccountClient instance
 * @internal
 */
export function createMyAccountClient(config: ClientAuthConfig): MyAccountClient {
  if (config.mode === 'proxy') {
    return new MyAccountClient({
      domain: '',
      baseUrl: new URL(MY_ACCOUNT_PROXY_PATH, config.proxyUrl).href,
      telemetry: false,
      fetcher: createProxyFetcher(),
    });
  }

  return new MyAccountClient({
    domain: config.domain,
    telemetry: false,
    fetcher: createSpaFetcher(config, MY_ACCOUNT_DPOP_NONCE_ID),
  });
}

/**
 * Creates a MyOrganizationClient configured for the given auth mode.
 * @param config - Auth configuration (proxy or SPA mode)
 * @returns Configured MyOrganizationClient instance
 * @internal
 */
export function createMyOrganizationClient(config: ClientAuthConfig): MyOrganizationClient {
  if (config.mode === 'proxy') {
    return new MyOrganizationClient({
      domain: '',
      baseUrl: new URL(MY_ORGANIZATION_PROXY_PATH, config.proxyUrl).href,
      telemetry: false,
      fetcher: createProxyFetcher(),
    });
  }

  return new MyOrganizationClient({
    domain: config.domain,
    telemetry: false,
    fetcher: createSpaFetcher(config, MY_ORGANIZATION_DPOP_NONCE_ID),
  });
}
