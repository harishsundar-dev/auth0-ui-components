import { MyAccountClient } from '@auth0/myaccount-js';
import { MyOrganizationClient } from '@auth0/myorganization-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SdkFetcherSupplier, SpaAuthConfig } from '../../auth/auth-types';
import {
  createMockContextInterface,
  mockProxyConfig,
  TEST_DOMAIN,
} from '../../internals/__mocks__/shared/api-service.mocks';
import {
  AUTH0_SCOPE_HEADER,
  createMyAccountClient,
  createMyOrganizationClient,
  MY_ACCOUNT_DPOP_NONCE_ID,
  MY_ACCOUNT_PROXY_PATH,
  MY_ORGANIZATION_DPOP_NONCE_ID,
  MY_ORGANIZATION_PROXY_PATH,
} from '../api-clients';

vi.mock('@auth0/myaccount-js', () => ({ MyAccountClient: vi.fn() }));
vi.mock('@auth0/myorganization-js', () => ({ MyOrganizationClient: vi.fn() }));

describe('api-clients', () => {
  const mockFetchWithAuth = vi.fn().mockResolvedValue(new Response());
  const mockCreateFetcher = vi.fn().mockReturnValue({
    fetchWithAuth: mockFetchWithAuth,
  });

  const createSpaConfig = (): SpaAuthConfig => ({
    mode: 'spa',
    domain: TEST_DOMAIN,
    contextInterface: {
      ...createMockContextInterface(),
      createFetcher: mockCreateFetcher,
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateFetcher.mockReturnValue({
      fetchWithAuth: mockFetchWithAuth,
    });
  });

  describe('createMyAccountClient', () => {
    it('creates client with baseUrl in proxy mode', () => {
      createMyAccountClient(mockProxyConfig);

      expect(MyAccountClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: new URL(MY_ACCOUNT_PROXY_PATH, mockProxyConfig.proxyUrl).href,
          telemetry: false,
        }),
      );
    });

    it('creates client with domain in SPA mode', () => {
      createMyAccountClient(createSpaConfig());

      expect(MyAccountClient).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: TEST_DOMAIN,
          telemetry: false,
        }),
      );
    });

    it('calls SDK createFetcher with correct dpopNonceId in SPA mode', () => {
      createMyAccountClient(createSpaConfig());

      expect(mockCreateFetcher).toHaveBeenCalledWith({
        dpopNonceId: MY_ACCOUNT_DPOP_NONCE_ID,
      });
    });

    describe('proxy mode fetcher', () => {
      it('sets auth0-scope header when authParams has scope array', async () => {
        createMyAccountClient(mockProxyConfig);

        const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
        const fetcher = constructorOptions.fetcher as SdkFetcherSupplier;
        const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

        await fetcher(
          'https://example.com',
          { method: 'GET' },
          { scope: ['read:users', 'write:users'], audience: 'test-audience' },
        );

        expect(mockFetch).toHaveBeenCalledWith(
          'https://example.com',
          expect.objectContaining({ method: 'GET' }),
        );

        const [, requestInit] = mockFetch.mock.calls[0]!;
        expect((requestInit?.headers as Headers).get(AUTH0_SCOPE_HEADER)).toBe(
          'read:users write:users',
        );

        mockFetch.mockRestore();
      });

      it('does not set auth0-scope header when authParams has empty scope array', async () => {
        createMyAccountClient(mockProxyConfig);

        const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
        const fetcher = constructorOptions.fetcher as SdkFetcherSupplier;
        const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

        await fetcher('https://example.com', { method: 'GET' }, { scope: [], audience: 'test' });

        const [, requestInit] = mockFetch.mock.calls[0]!;
        expect((requestInit?.headers as Headers).get(AUTH0_SCOPE_HEADER)).toBeNull();

        mockFetch.mockRestore();
      });
    });

    describe('SPA mode fetcher', () => {
      it('calls SDK fetchWithAuth with scope and audience', async () => {
        createMyAccountClient(createSpaConfig());

        const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
        const fetcher = constructorOptions.fetcher as SdkFetcherSupplier;

        await fetcher(
          'https://example.com',
          { method: 'GET' },
          { scope: ['read:users', 'write:users'], audience: 'https://tenant.auth0.com/me/' },
        );

        expect(mockFetchWithAuth).toHaveBeenCalledWith(
          'https://example.com',
          { method: 'GET' },
          { scope: ['read:users', 'write:users'], audience: 'https://tenant.auth0.com/me/' },
        );
      });

      it('handles undefined authParams', async () => {
        createMyAccountClient(createSpaConfig());

        const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
        const fetcher = constructorOptions.fetcher as SdkFetcherSupplier;

        await fetcher('https://example.com', { method: 'GET' }, undefined);

        expect(mockFetchWithAuth).toHaveBeenCalledWith(
          'https://example.com',
          { method: 'GET' },
          { scope: undefined, audience: undefined },
        );
      });
    });
  });

  describe('createMyOrganizationClient', () => {
    it('creates client with baseUrl in proxy mode', () => {
      createMyOrganizationClient(mockProxyConfig);

      expect(MyOrganizationClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: new URL(MY_ORGANIZATION_PROXY_PATH, mockProxyConfig.proxyUrl).href,
          telemetry: false,
        }),
      );
    });

    it('creates client with domain in SPA mode', () => {
      createMyOrganizationClient(createSpaConfig());

      expect(MyOrganizationClient).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: TEST_DOMAIN,
          telemetry: false,
        }),
      );
    });

    it('calls SDK createFetcher with correct dpopNonceId in SPA mode', () => {
      createMyOrganizationClient(createSpaConfig());

      expect(mockCreateFetcher).toHaveBeenCalledWith({
        dpopNonceId: MY_ORGANIZATION_DPOP_NONCE_ID,
      });
    });

    describe('proxy mode fetcher', () => {
      it('sets auth0-scope header when authParams has scope array', async () => {
        createMyOrganizationClient(mockProxyConfig);

        const constructorOptions = vi.mocked(MyOrganizationClient).mock.calls[0]![0];
        const fetcher = constructorOptions.fetcher as SdkFetcherSupplier;
        const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

        await fetcher(
          'https://example.com',
          { method: 'GET' },
          { scope: ['read:org', 'write:org'], audience: 'test-audience' },
        );

        const [, requestInit] = mockFetch.mock.calls[0]!;
        expect((requestInit?.headers as Headers).get(AUTH0_SCOPE_HEADER)).toBe(
          'read:org write:org',
        );

        mockFetch.mockRestore();
      });
    });

    describe('SPA mode fetcher', () => {
      it('calls SDK fetchWithAuth with scope and audience', async () => {
        createMyOrganizationClient(createSpaConfig());

        const constructorOptions = vi.mocked(MyOrganizationClient).mock.calls[0]![0];
        const fetcher = constructorOptions.fetcher as SdkFetcherSupplier;

        await fetcher(
          'https://example.com',
          { method: 'POST', body: '{}' },
          { scope: ['read:org'], audience: 'https://tenant.auth0.com/my-org/' },
        );

        expect(mockFetchWithAuth).toHaveBeenCalledWith(
          'https://example.com',
          { method: 'POST', body: '{}' },
          { scope: ['read:org'], audience: 'https://tenant.auth0.com/my-org/' },
        );
      });
    });
  });
});
