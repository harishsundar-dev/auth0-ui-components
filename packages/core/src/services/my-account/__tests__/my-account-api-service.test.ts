import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { SpaAuthConfig } from '../../../auth/auth-types';
import {
  createMockFetch,
  getConfigFromMockCalls,
  getFetcherFromMockCalls,
  getHeadersFromFetchCall,
} from '../../../internals/__mocks__/shared/sdk-client.mocks';
import { initializeMyAccountClient } from '../my-account-api-service';

import {
  createMockContextInterface,
  mockProxyConfig,
  createMockSpaConfig,
  getExpectedProxyBaseUrl,
  mockScopes,
  mockTokens,
} from './__mocks__/my-account-api-service.mocks';

const TEST_URL = 'https://test.com';

// Hoist mock to avoid vi.mock hoisting issues
const mockMyAccountClient = vi.hoisted(() =>
  vi.fn().mockImplementation((config) => ({
    config,
    authenticationMethods: {
      list: vi.fn(),
    },
  })),
);

vi.mock('@auth0/myaccount-js', () => ({
  MyAccountClient: mockMyAccountClient,
}));

describe('initializeMyAccountClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('proxy mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyAccountClient with proxy URL', () => {
        const result = initializeMyAccountClient(mockProxyConfig);

        expect(result).toHaveProperty('client');
        expect(result).toHaveProperty('setLatestScopes');
        expect(mockMyAccountClient).toHaveBeenCalled();
      });

      it('should construct correct base URL from proxy URL', () => {
        initializeMyAccountClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.baseUrl).toBe(getExpectedProxyBaseUrl(mockProxyConfig.proxyUrl));
      });

      it('should set domain to empty string in proxy mode', () => {
        initializeMyAccountClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.domain).toBe('');
      });

      it('should disable telemetry in proxy mode', () => {
        initializeMyAccountClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.telemetry).toBe(false);
      });

      it('should provide custom fetcher in proxy mode', () => {
        initializeMyAccountClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });
    });

    describe('setLatestScopes function', () => {
      it('should provide setLatestScopes function', () => {
        const result = initializeMyAccountClient(mockProxyConfig);

        expect(result.setLatestScopes).toBeDefined();
        expect(typeof result.setLatestScopes).toBe('function');
      });

      it('should accept scope strings without throwing', () => {
        const result = initializeMyAccountClient(mockProxyConfig);

        expect(() => result.setLatestScopes(mockScopes.mfa)).not.toThrow();
      });

      it('should handle empty scope string', () => {
        const result = initializeMyAccountClient(mockProxyConfig);

        expect(() => result.setLatestScopes('')).not.toThrow();
      });

      it('should handle complex scope strings', () => {
        const result = initializeMyAccountClient(mockProxyConfig);

        const complexScopes = `${mockScopes.mfa} ${mockScopes.profile} ${mockScopes.email}`;
        expect(() => result.setLatestScopes(complexScopes)).not.toThrow();
      });
    });

    describe('custom fetcher behavior in proxy mode', () => {
      it('should create fetcher that calls fetch', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        initializeMyAccountClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {});

        expect(mockFetch).toHaveBeenCalled();
      });

      it('should add scope header when scopes are set', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const result = initializeMyAccountClient(mockProxyConfig);
        result.setLatestScopes(mockScopes.mfa);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {});

        expect(mockFetch).toHaveBeenCalledWith(
          TEST_URL,
          expect.objectContaining({
            headers: expect.objectContaining({
              'auth0-scope': mockScopes.mfa,
            }),
          }),
        );
      });

      it('should add Content-Type header when body is present', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        initializeMyAccountClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, { body: JSON.stringify({ test: 'data' }) });

        expect(mockFetch).toHaveBeenCalledWith(
          TEST_URL,
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          }),
        );
      });

      it('should not add scope header when scope is empty', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const result = initializeMyAccountClient(mockProxyConfig);
        result.setLatestScopes('');

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {});

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['auth0-scope']).toBeUndefined();
      });

      it('should preserve existing headers', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        initializeMyAccountClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {
          headers: {
            'X-Custom-Header': 'custom-value',
          },
        });

        expect(mockFetch).toHaveBeenCalledWith(
          TEST_URL,
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Custom-Header': 'custom-value',
            }),
          }),
        );
      });

      it('should update scope header when scopes change', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const result = initializeMyAccountClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        result.setLatestScopes(mockScopes.mfa);
        await fetcher!(TEST_URL, {});

        result.setLatestScopes(mockScopes.profile);
        await fetcher!(TEST_URL, {});

        expect(mockFetch).toHaveBeenNthCalledWith(
          1,
          TEST_URL,
          expect.objectContaining({
            headers: expect.objectContaining({ 'auth0-scope': mockScopes.mfa }),
          }),
        );

        expect(mockFetch).toHaveBeenNthCalledWith(
          2,
          TEST_URL,
          expect.objectContaining({
            headers: expect.objectContaining({ 'auth0-scope': mockScopes.profile }),
          }),
        );
      });
    });

    describe('URL handling', () => {
      it('should handle proxy URL with path', () => {
        initializeMyAccountClient({ mode: 'proxy', proxyUrl: 'https://example.com/api/v1' });

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.baseUrl).toBe('https://example.com/api/v1/me');
      });

      it('should handle proxy URL with port', () => {
        initializeMyAccountClient({ mode: 'proxy', proxyUrl: 'https://example.com:8080' });

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.baseUrl).toBe('https://example.com:8080/me');
      });

      it('should handle proxy URL with query parameters', () => {
        initializeMyAccountClient({ mode: 'proxy', proxyUrl: 'https://example.com?param=value' });

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.baseUrl).toBe('https://example.com?param=value/me');
      });
    });
  });

  describe('SPA mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyAccountClient with domain', () => {
        const result = initializeMyAccountClient(createMockSpaConfig());

        expect(result).toHaveProperty('client');
        expect(result).toHaveProperty('setLatestScopes');
        expect(mockMyAccountClient).toHaveBeenCalled();
      });

      it('should not set baseUrl when using domain', () => {
        initializeMyAccountClient(createMockSpaConfig());

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.baseUrl).toBeUndefined();
      });

      it('should provide custom fetcher in SPA mode', () => {
        initializeMyAccountClient(createMockSpaConfig());

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });
    });

    describe('setLatestScopes function', () => {
      it('should provide setLatestScopes function in SPA mode', () => {
        const result = initializeMyAccountClient(createMockSpaConfig());

        expect(result.setLatestScopes).toBeDefined();
        expect(typeof result.setLatestScopes).toBe('function');
      });

      it('should track scope changes in SPA mode', () => {
        const result = initializeMyAccountClient(createMockSpaConfig());

        expect(() => result.setLatestScopes(mockScopes.mfa)).not.toThrow();
        expect(() => result.setLatestScopes(mockScopes.profile)).not.toThrow();
      });
    });

    describe('custom fetcher behavior in SPA mode', () => {
      it('should call getAccessTokenSilently with scopes and audience', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        const result = initializeMyAccountClient(auth);
        result.setLatestScopes(mockScopes.mfa);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {});

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
          expect.objectContaining({
            authorizationParams: expect.objectContaining({ scope: mockScopes.mfa }),
          }),
        );
      });

      it('should add Authorization header with Bearer token', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {});

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
      });

      it('should add Content-Type header when body is present', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, { body: JSON.stringify({ test: 'data' }) });

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/json');
      });

      it('should not override existing Content-Type header', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {
          body: JSON.stringify({ test: 'data' }),
          headers: { 'Content-Type': 'application/custom' },
        });

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/custom');
      });

      it('should not add Authorization header when token is empty', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig('');
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await expect(fetcher!(TEST_URL, {})).resolves.toBeDefined();

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Authorization')).toBeNull();
      });

      it('should use Headers object for header management', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {});

        const fetchCall = mockFetch.mock.calls[0]!;
        expect(fetchCall[1]!.headers).toBeInstanceOf(Headers);
      });

      it('should preserve existing headers from init', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, { headers: { 'X-Custom-Header': 'custom-value' } });

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('X-Custom-Header')).toBe('custom-value');
      });

      it('should not add Content-Type for GET requests without body', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, { method: 'GET' });

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBeNull();
      });
    });

    describe('token retrieval', () => {
      it('should request token with latest scopes', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        const result = initializeMyAccountClient(auth);
        result.setLatestScopes(mockScopes.mfa);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {});

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
          expect.objectContaining({
            authorizationParams: expect.objectContaining({ scope: mockScopes.mfa }),
          }),
        );
      });

      it('should request token with "me" audience', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {});

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
          expect.objectContaining({
            authorizationParams: expect.objectContaining({
              audience: expect.stringContaining('me'),
            }),
          }),
        );
      });

      it('should handle very long tokens', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig('a'.repeat(2000));
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {});

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${'a'.repeat(2000)}`);
      });

      it('should handle tokens with special characters', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig(mockTokens.withSpecialChars);
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await fetcher!(TEST_URL, {});

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.withSpecialChars}`);
      });

      it('should not call getConfiguration — domain is always explicitly provided', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const contextInterface = createMockContextInterface();
        const auth: SpaAuthConfig = { mode: 'spa', domain: 'direct.auth0.com', contextInterface };
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, {});

        expect(contextInterface.getConfiguration).not.toHaveBeenCalled();
        expect(mockMyAccountClient).toHaveBeenCalledWith(
          expect.objectContaining({ domain: 'direct.auth0.com' }),
        );
      });
    });
  });

  describe('edge cases', () => {
    describe('special characters in URLs', () => {
      it('should handle domain with special characters', () => {
        const auth: SpaAuthConfig = {
          mode: 'spa',
          domain: 'my-domain.eu.auth0.com',
          contextInterface: createMockContextInterface(),
        };

        const result = initializeMyAccountClient(auth);

        expect(result.client).toBeDefined();
      });

      it('should handle proxy URL with encoded characters', () => {
        const result = initializeMyAccountClient({
          mode: 'proxy',
          proxyUrl: 'https://example.com/path%20with%20spaces',
        });

        expect(result.client).toBeDefined();
      });

      it('should handle international domains', () => {
        const auth: SpaAuthConfig = {
          mode: 'spa',
          domain: 'münchen.auth0.com',
          contextInterface: createMockContextInterface(),
        };

        const result = initializeMyAccountClient(auth);

        expect(result.client).toBeDefined();
      });
    });

    describe('multiple consecutive calls', () => {
      it('should handle multiple scope updates', () => {
        const result = initializeMyAccountClient(mockProxyConfig);

        expect(() => {
          result.setLatestScopes(mockScopes.mfa);
          result.setLatestScopes(mockScopes.profile);
          result.setLatestScopes(mockScopes.email);
          result.setLatestScopes('');
        }).not.toThrow();
      });

      it('should create independent instances on each call', () => {
        const result1 = initializeMyAccountClient(mockProxyConfig);
        const result2 = initializeMyAccountClient(mockProxyConfig);

        expect(result1.client).not.toBe(result2.client);
        expect(result1.setLatestScopes).not.toBe(result2.setLatestScopes);
      });
    });

    describe('concurrent operations', () => {
      it('should handle concurrent scope updates', () => {
        const result = initializeMyAccountClient(mockProxyConfig);

        expect(() => {
          result.setLatestScopes(mockScopes.mfa);
          result.setLatestScopes(mockScopes.profile);
        }).not.toThrow();
      });

      it('should handle concurrent fetcher calls in proxy mode', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const result = initializeMyAccountClient(mockProxyConfig);
        result.setLatestScopes(mockScopes.mfa);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await Promise.all([
          fetcher!('https://test.com/1', {}),
          fetcher!('https://test.com/2', {}),
          fetcher!('https://test.com/3', {}),
        ]);

        expect(mockFetch).toHaveBeenCalledTimes(3);
      });

      it('should handle concurrent fetcher calls in SPA mode', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        const result = initializeMyAccountClient(auth);
        result.setLatestScopes(mockScopes.mfa);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await Promise.all([
          fetcher!('https://test.com/1', {}),
          fetcher!('https://test.com/2', {}),
          fetcher!('https://test.com/3', {}),
        ]);

        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('return value structure', () => {
    it('should return object with client and setLatestScopes', () => {
      const result = initializeMyAccountClient(mockProxyConfig);

      expect(result).toHaveProperty('client');
      expect(result).toHaveProperty('setLatestScopes');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should have client as MyAccountClient instance', () => {
      const result = initializeMyAccountClient(mockProxyConfig);

      expect(result.client).toBeDefined();
      expect(mockMyAccountClient).toHaveBeenCalled();
    });

    it('should have setLatestScopes as a function', () => {
      const result = initializeMyAccountClient(mockProxyConfig);

      expect(typeof result.setLatestScopes).toBe('function');
    });

    it('should return new instances on each call', () => {
      const result1 = initializeMyAccountClient(mockProxyConfig);
      const result2 = initializeMyAccountClient(mockProxyConfig);

      expect(result1).not.toBe(result2);
      expect(result1.client).not.toBe(result2.client);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete proxy mode workflow', async () => {
      const mockFetch = createMockFetch();
      vi.stubGlobal('fetch', mockFetch);

      const result = initializeMyAccountClient(mockProxyConfig);

      result.setLatestScopes(mockScopes.mfa);

      const config = getConfigFromMockCalls(mockMyAccountClient);
      const fetcher = config.fetcher;

      await fetcher!(TEST_URL, { body: JSON.stringify({ test: 'data' }) });

      expect(config.baseUrl).toBeDefined();
      expect(config.domain).toBe('');
      expect(config.telemetry).toBe(false);

      expect(mockFetch).toHaveBeenCalledWith(
        TEST_URL,
        expect.objectContaining({
          headers: expect.objectContaining({
            'auth0-scope': mockScopes.mfa,
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should handle complete SPA mode workflow', async () => {
      const mockFetch = createMockFetch();
      vi.stubGlobal('fetch', mockFetch);

      const auth = createMockSpaConfig();
      const result = initializeMyAccountClient(auth);

      result.setLatestScopes(mockScopes.mfa);

      const config = getConfigFromMockCalls(mockMyAccountClient);
      const fetcher = config.fetcher;

      await fetcher!(TEST_URL, { body: JSON.stringify({ test: 'data' }) });

      expect(config.domain).toBe('test.auth0.com');
      expect(config.baseUrl).toBeUndefined();

      expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
        expect.objectContaining({
          authorizationParams: expect.objectContaining({ scope: mockScopes.mfa }),
        }),
      );

      const headers = getHeadersFromFetchCall(mockFetch) as Headers;
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle switching from empty scope to populated scope', async () => {
      const mockFetch = createMockFetch();
      vi.stubGlobal('fetch', mockFetch);

      const auth = createMockSpaConfig();
      const result = initializeMyAccountClient(auth);

      const config = getConfigFromMockCalls(mockMyAccountClient);
      const fetcher = config.fetcher;

      result.setLatestScopes('');
      await fetcher!(TEST_URL, {});

      result.setLatestScopes(mockScopes.mfa);
      await fetcher!(TEST_URL, {});

      expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(2);
      expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          authorizationParams: expect.objectContaining({ scope: '' }),
        }),
      );
      expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          authorizationParams: expect.objectContaining({ scope: mockScopes.mfa }),
        }),
      );
    });
  });
});
