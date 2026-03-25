/**
 * Shared client initialization helpers.
 * @module api-utils
 * @internal
 */

import type { FetcherSupplier, SpaAuthConfig } from '../auth/auth-types';

import { ContentType, HeaderName } from './http-constants';

export const AUTH0_SCOPE_HEADER = HeaderName.Auth0Scope;

/**
 * Creates a fetcher function for proxy mode that injects scopes via auth0-scope header.
 * The proxy will extract scopes from the header and request the appropriate token.
 * @returns Fetcher function that sets auth0-scope and content-type headers
 * @internal
 */
export function createProxyFetcher(): FetcherSupplier {
  return async (url, init, authParams) => {
    const headers = new Headers(init?.headers);
    headers.set(HeaderName.ContentType, ContentType.JSON);
    if (authParams?.scope?.length) {
      headers.set(HeaderName.Auth0Scope, authParams.scope.join(' '));
    }
    return fetch(url, { ...init, headers });
  };
}

/**
 * Creates a fetcher function for SPA mode using Auth0 SDK's createFetcher.
 * @param config - SPA auth configuration with context interface
 * @param dpopNonceId - Unique identifier for DPoP nonce management
 * @returns Fetcher function that delegates to SDK's fetchWithAuth with JSON content-type
 * @internal
 */
export function createSpaFetcher(config: SpaAuthConfig, dpopNonceId: string): FetcherSupplier {
  const sdkFetcher = config.contextInterface.createFetcher({ dpopNonceId });
  return (url, init, authParams) => {
    const headers = new Headers(init?.headers);
    headers.set(HeaderName.ContentType, ContentType.JSON);
    return sdkFetcher.fetchWithAuth(
      url,
      { ...init, headers },
      {
        scope: authParams?.scope,
        audience: authParams?.audience,
      },
    );
  };
}

/**
 * Extracts unique OAuth scopes from Fern SDK endpoint metadata.
 * @param endpointMetadata - The endpoint metadata containing security schemes
 * @returns Array of unique scope strings
 * @internal
 */
function extractScopesFromMetadata(endpointMetadata?: {
  security?: Record<string, string[]>[];
}): string[] {
  if (!endpointMetadata?.security) return [];
  const scopes = new Set<string>();
  for (const scheme of endpointMetadata.security) {
    for (const scopeList of Object.values(scheme)) {
      for (const s of scopeList) scopes.add(s);
    }
  }
  return [...scopes];
}

/**
 * A no-op auth provider that returns empty headers.
 * Used when the custom fetcher handles authentication itself.
 * @internal
 */
export const noOpAuthProvider = {
  async getAuthRequest() {
    return { headers: {} };
  },
};

/**
 * Wraps a FetcherSupplier into a Fern-SDK-compatible FetchFunction.
 *
 * The Fern-generated SDK expects `fetcher(args: Fetcher.Args) → Promise<APIResponse>`,
 * but our FetcherSupplier has signature `(url, init, authParams) → Promise<Response>`.
 * This adapter bridges the two interfaces, extracting scopes from endpoint metadata
 * and converting the native Response into the Fern APIResponse format.
 * @param fetcherSupplier - The fetcher function to wrap
 * @returns A Fern-SDK-compatible fetch function
 * @internal
 */
export function createFernCompatibleFetcher(fetcherSupplier: FetcherSupplier) {
  return async (args: {
    url: string;
    method: string;
    headers?: Record<string, unknown>;
    queryParameters?: Record<string, unknown>;
    body?: unknown;
    timeoutMs?: number;
    abortSignal?: AbortSignal;
    requestType?: string;
    endpointMetadata?: { security?: Record<string, string[]>[] };
  }) => {
    // Build URL with query parameters
    let url = args.url;
    if (args.queryParameters) {
      const params: string[] = [];
      for (const [key, value] of Object.entries(args.queryParameters)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const v of value) {
            if (v !== undefined)
              params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
          }
        } else {
          params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
      }
      const qs = params.join('&');
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }

    // Build headers
    const headers: Record<string, string> = {};
    if (args.headers) {
      for (const [key, value] of Object.entries(args.headers)) {
        if (value != null) headers[key] = String(value);
      }
    }

    // Build request body
    let body: string | undefined;
    if (args.body != null) {
      body = typeof args.body === 'string' ? args.body : JSON.stringify(args.body);
    }

    // Extract scopes from endpoint metadata
    const scopes = extractScopesFromMetadata(args.endpointMetadata);

    const init: RequestInit = {
      method: args.method,
      headers,
      body,
      signal: args.abortSignal,
    };

    const response = await fetcherSupplier(url, init, {
      scope: scopes.length > 0 ? scopes : undefined,
    });

    // Convert native Response to Fern APIResponse format
    if (response.ok) {
      let responseBody: unknown;
      try {
        responseBody = await response.json();
      } catch {
        try {
          responseBody = await response.text();
        } catch {
          responseBody = undefined;
        }
      }
      return {
        ok: true as const,
        body: responseBody,
        headers: response.headers,
        rawResponse: response,
      };
    }

    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      try {
        errorBody = await response.text();
      } catch {
        errorBody = undefined;
      }
    }
    return {
      ok: false as const,
      error: {
        reason: 'status-code' as const,
        statusCode: response.status,
        body: errorBody,
      },
      rawResponse: response,
    };
  };
}
