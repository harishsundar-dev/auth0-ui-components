import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { SpaAuthConfig } from '../../../auth/auth-types';
import {
  createMockFetch,
  getConfigFromMockCalls,
  getFetcherFromMockCalls,
  getHeadersFromFetchCall,
} from '../../../internals/__mocks__/shared/sdk-client.mocks';
import { initializeMyOrganizationClient } from '../my-organization-api-service';

import {
  mockProxyConfig,
  createMockSpaConfig,
  mockScopes,
  mockTokens,
  mockRequestInits,
} from './__mocks__/my-organization-api-service.mocks';

const TEST_URL = 'https://api.example.com/test';

// Hoist mock to avoid vi.mock hoisting issues
const mockMyOrganizationClient = vi.hoisted(() => vi.fn());

vi.mock('@auth0/myorganization-js', () => ({
  MyOrganizationClient: mockMyOrganizationClient,
}));

describe('initializeMyOrganizationClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = createMockFetch();
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('proxy mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyOrganizationClient with proxy URL', () => {
        initializeMyOrganizationClient(mockProxyConfig);

        expect(mockMyOrganizationClient).toHaveBeenCalledTimes(1);
      });

      it('should construct correct base URL from proxy URL', () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com/my-org');
      });

      it('should set domain to empty string in proxy mode', () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.domain).toBe('');
      });

      it('should disable telemetry in proxy mode', () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.telemetry).toBe(false);
      });

      it('should provide custom fetcher in proxy mode', () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });
    });

    describe('setLatestScopes function', () => {
      it('should provide setLatestScopes function', () => {
        const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

        expect(setLatestScopes).toBeDefined();
        expect(typeof setLatestScopes).toBe('function');
      });

      it('should accept scope strings without throwing', () => {
        const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

        expect(() => setLatestScopes(mockScopes.organizationRead)).not.toThrow();
      });

      it('should handle empty scope string', () => {
        const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

        expect(() => setLatestScopes(mockScopes.empty)).not.toThrow();
      });

      it('should handle complex scope strings', () => {
        const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

        expect(() => setLatestScopes(mockScopes.complex)).not.toThrow();
      });
    });

    describe('custom fetcher behavior in proxy mode', () => {
      it('should create fetcher that calls fetch', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.get);

        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('should add scope header when scopes are set', async () => {
        const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['auth0-scope']).toBe(mockScopes.organizationRead);
      });

      it('should add Content-Type header when body is present', async () => {
        const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['Content-Type']).toBe('application/json');
      });

      it('should not add scope header when scope is empty', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['auth0-scope']).toBeUndefined();
      });

      it('should preserve existing headers', async () => {
        const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.postWithHeaders);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['X-Custom-Header']).toBe('custom-value');
        expect(headers['auth0-scope']).toBe(mockScopes.organizationRead);
      });

      it('should update scope header when scopes change', async () => {
        const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const firstHeaders = mockFetch.mock.calls[0]![1]!.headers;
        expect(firstHeaders['auth0-scope']).toBe(mockScopes.organizationRead);

        setLatestScopes(mockScopes.complex);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const secondHeaders = mockFetch.mock.calls[1]![1]!.headers;
        expect(secondHeaders['auth0-scope']).toBe(mockScopes.complex);
      });

      it('should not add Content-Type header for GET requests without body', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.get);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['Content-Type']).toBeUndefined();
      });

      it('should handle requests without init parameter', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
          TEST_URL,
          expect.objectContaining({ headers: expect.any(Object) }),
        );
      });
    });

    describe('URL handling', () => {
      it('should handle proxy URL with path', () => {
        initializeMyOrganizationClient({
          mode: 'proxy',
          proxyUrl: 'https://proxy.example.com/api/v1',
        });

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com/api/v1/my-org');
      });

      it('should handle proxy URL with port', () => {
        initializeMyOrganizationClient({
          mode: 'proxy',
          proxyUrl: 'https://proxy.example.com:8080',
        });

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com:8080/my-org');
      });

      it('should handle proxy URL with query parameters', () => {
        initializeMyOrganizationClient({
          mode: 'proxy',
          proxyUrl: 'https://proxy.example.com?param=value',
        });

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com?param=value/my-org');
      });
    });
  });

  describe('SPA mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyOrganizationClient with domain', () => {
        initializeMyOrganizationClient(createMockSpaConfig());

        expect(mockMyOrganizationClient).toHaveBeenCalledTimes(1);
      });

      it('should not set baseUrl in SPA mode', () => {
        initializeMyOrganizationClient(createMockSpaConfig());

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBeUndefined();
      });

      it('should not set telemetry in SPA mode', () => {
        initializeMyOrganizationClient(createMockSpaConfig());

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.telemetry).toBeUndefined();
      });

      it('should provide custom fetcher in SPA mode', () => {
        initializeMyOrganizationClient(createMockSpaConfig());

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });

      it('should provide setLatestScopes function', () => {
        const { setLatestScopes } = initializeMyOrganizationClient(createMockSpaConfig());

        expect(setLatestScopes).toBeDefined();
        expect(typeof setLatestScopes).toBe('function');
      });
    });

    describe('custom fetcher behavior in SPA mode', () => {
      it('should call getAccessTokenSilently with correct parameters', async () => {
        const auth = createMockSpaConfig();
        const { setLatestScopes } = initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(1);
        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
          expect.objectContaining({
            authorizationParams: expect.objectContaining({
              scope: mockScopes.organizationRead,
              audience: expect.stringContaining('my-org'),
            }),
          }),
        );
      });

      it('should add Authorization header with token', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
      });

      it('should add Content-Type header when body is present', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/json');
      });

      it('should not override existing Content-Type header', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.withContentType);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
      });

      it('should handle scope updates correctly', async () => {
        const auth = createMockSpaConfig();
        const { setLatestScopes } = initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            authorizationParams: expect.objectContaining({ scope: mockScopes.organizationRead }),
          }),
        );

        setLatestScopes(mockScopes.complex);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            authorizationParams: expect.objectContaining({ scope: mockScopes.complex }),
          }),
        );
      });

      it('should use Headers object for headers', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers).toBeInstanceOf(Headers);
      });

      it('should handle requests without init parameter', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(1);
      });

      it('should handle empty scope string', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
          expect.objectContaining({
            authorizationParams: expect.objectContaining({ scope: '' }),
          }),
        );
      });

      it('should not add Content-Type for GET requests without body', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.get);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBeNull();
      });
    });

    describe('token retrieval errors', () => {
      it('should propagate token retrieval errors', async () => {
        const auth: SpaAuthConfig = {
          mode: 'spa',
          domain: 'test.auth0.com',
          contextInterface: {
            isAuthenticated: true,
            getAccessTokenSilently: vi.fn().mockRejectedValue(new Error('Token retrieval failed')),
            getAccessTokenWithPopup: vi.fn(),
            loginWithRedirect: vi.fn(),
            getConfiguration: vi
              .fn()
              .mockReturnValue({ domain: 'test.auth0.com', clientId: 'client-id' }),
          },
        };
        initializeMyOrganizationClient(auth);

        const config = mockMyOrganizationClient.mock.calls[0]![0];
        const fetcher = config.fetcher;

        await expect(fetcher(TEST_URL, mockRequestInits.post)).rejects.toThrow(
          'Token retrieval failed',
        );
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very long scope strings', async () => {
      const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

      const longScope = 'read:organization '.repeat(100).trim();
      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      setLatestScopes(longScope);
      await fetcher!(TEST_URL, mockRequestInits.post);

      expect(mockFetch.mock.calls[0]![1]!.headers['auth0-scope']).toBe(longScope);
    });

    it('should handle very long tokens', async () => {
      const auth = createMockSpaConfig(mockTokens.long);
      initializeMyOrganizationClient(auth);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      await fetcher!(TEST_URL, mockRequestInits.post);

      const headers = mockFetch.mock.calls[0]![1]!.headers;
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.long}`);
    });

    it('should handle tokens with special characters', async () => {
      const auth = createMockSpaConfig(mockTokens.withSpecialChars);
      initializeMyOrganizationClient(auth);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      await fetcher!(TEST_URL, mockRequestInits.post);

      const headers = mockFetch.mock.calls[0]![1]!.headers;
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.withSpecialChars}`);
    });

    it('should handle multiple rapid scope changes', async () => {
      const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      for (let i = 0; i < 5; i++) {
        setLatestScopes(`scope${i}`);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(mockFetch.mock.calls[i]![1]!.headers['auth0-scope']).toBe(`scope${i}`);
      }
    });

    it('should handle Headers object in init.headers', async () => {
      const auth = createMockSpaConfig();
      initializeMyOrganizationClient(auth);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      const headersObj = new Headers();
      headersObj.set('X-Custom', 'value');

      await fetcher!(TEST_URL, {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: headersObj,
      });

      const headers = mockFetch.mock.calls[0]![1]!.headers;
      expect(headers.get('X-Custom')).toBe('value');
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
    });

    it('should handle array-based headers in init.headers for proxy mode', async () => {
      initializeMyOrganizationClient(mockProxyConfig);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      await fetcher!(TEST_URL, {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'X-Custom': 'value' } as HeadersInit,
      });

      expect(mockFetch.mock.calls[0]![1]!.headers['X-Custom']).toBe('value');
    });

    it('should handle scope strings with leading/trailing whitespace', async () => {
      const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      setLatestScopes(mockScopes.withSpaces);
      await fetcher!(TEST_URL, mockRequestInits.post);

      expect(mockFetch.mock.calls[0]![1]!.headers['auth0-scope']).toBe(mockScopes.withSpaces);
    });

    it('should handle PATCH requests with body', async () => {
      const auth = createMockSpaConfig();
      initializeMyOrganizationClient(auth);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      await fetcher!(TEST_URL, mockRequestInits.patch);

      const headers = mockFetch.mock.calls[0]![1]!.headers;
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
    });

    it('should handle undefined body', async () => {
      initializeMyOrganizationClient(mockProxyConfig);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      await fetcher!(TEST_URL, { method: 'POST', body: undefined });

      expect(mockFetch.mock.calls[0]![1]!.headers['Content-Type']).toBeUndefined();
    });

    it('should handle null body', async () => {
      initializeMyOrganizationClient(mockProxyConfig);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      await fetcher!(TEST_URL, { method: 'POST', body: null });

      expect(mockFetch.mock.calls[0]![1]!.headers['Content-Type']).toBeUndefined();
    });
  });

  describe('return value structure', () => {
    it('should return object with client and setLatestScopes', () => {
      const result = initializeMyOrganizationClient(mockProxyConfig);

      expect(result).toHaveProperty('client');
      expect(result).toHaveProperty('setLatestScopes');
    });

    it('should return MyOrganizationClient instance as client', () => {
      const { client } = initializeMyOrganizationClient(mockProxyConfig);

      expect(client).toBeInstanceOf(mockMyOrganizationClient);
    });

    it('should return function as setLatestScopes', () => {
      const { setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

      expect(typeof setLatestScopes).toBe('function');
    });

    it('should have consistent return structure for proxy mode', () => {
      const result = initializeMyOrganizationClient(mockProxyConfig);

      expect(Object.keys(result).sort()).toEqual(['client', 'setLatestScopes'].sort());
    });

    it('should have consistent return structure for SPA mode', () => {
      const result = initializeMyOrganizationClient(createMockSpaConfig());

      expect(Object.keys(result).sort()).toEqual(['client', 'setLatestScopes'].sort());
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete proxy mode workflow', async () => {
      const { client, setLatestScopes } = initializeMyOrganizationClient(mockProxyConfig);

      expect(client).toBeInstanceOf(mockMyOrganizationClient);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      setLatestScopes(mockScopes.organizationRead);
      await fetcher!(TEST_URL, mockRequestInits.post);

      expect(mockFetch).toHaveBeenCalled();
      expect(mockFetch.mock.calls[0]![1]!.headers['auth0-scope']).toBe(mockScopes.organizationRead);
    });

    it('should handle complete SPA mode workflow', async () => {
      const auth = createMockSpaConfig();
      const { client, setLatestScopes } = initializeMyOrganizationClient(auth);

      expect(client).toBeInstanceOf(mockMyOrganizationClient);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      setLatestScopes(mockScopes.complex);
      await fetcher!(TEST_URL, mockRequestInits.post);

      expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
        expect.objectContaining({
          authorizationParams: expect.objectContaining({ scope: mockScopes.complex }),
        }),
      );
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should support multiple clients with different configurations', () => {
      const proxyClient = initializeMyOrganizationClient(mockProxyConfig);
      const spaClient = initializeMyOrganizationClient(createMockSpaConfig());

      expect(proxyClient.client).toBeInstanceOf(mockMyOrganizationClient);
      expect(spaClient.client).toBeInstanceOf(mockMyOrganizationClient);
      expect(mockMyOrganizationClient).toHaveBeenCalledTimes(2);
    });
  });
});
