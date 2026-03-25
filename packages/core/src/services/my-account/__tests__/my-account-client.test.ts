import { MyAccountClient } from '@auth0/myaccount-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { stubFetch } from '../../../api/__tests__/__mocks__/api-utils.mocks';
import { AUTH0_SCOPE_HEADER } from '../../../api/api-utils';
import type { SpaAuthConfig } from '../../../auth/auth-types';
import {
  createMockContextInterface,
  mockProxyConfig,
  TEST_DOMAIN,
} from '../../../internals/__mocks__/shared/api-service.mocks';
import {
  createMyAccountClient,
  MY_ACCOUNT_DPOP_NONCE_ID,
  MY_ACCOUNT_PROXY_PATH,
} from '../my-account-client';

vi.mock('@auth0/myaccount-js', () => ({ MyAccountClient: vi.fn() }));

describe('createMyAccountClient', () => {
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
    mockFetchWithAuth.mockResolvedValue(
      new Response(JSON.stringify({}), { headers: { 'Content-Type': 'application/json' } }),
    );
    mockCreateFetcher.mockReturnValue({
      fetchWithAuth: mockFetchWithAuth,
    });
  });

  it('creates client with baseUrl in proxy mode', () => {
    createMyAccountClient(mockProxyConfig);

    expect(MyAccountClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: new URL(MY_ACCOUNT_PROXY_PATH, mockProxyConfig.proxyUrl).href,
        telemetry: false,
      }),
    );
  });

  it('creates client with baseUrl in SPA mode', () => {
    createMyAccountClient(createSpaConfig());

    expect(MyAccountClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: `https://${TEST_DOMAIN}/me/v1`,
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
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('sets auth0-scope header when authParams has scope array', async () => {
      const mockFetch = stubFetch();
      createMyAccountClient(mockProxyConfig);

      const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
      const fetcher = constructorOptions.fetcher as unknown as (
        args: Record<string, unknown>,
      ) => Promise<unknown>;

      await fetcher({
        url: 'https://example.com',
        method: 'GET',
        endpointMetadata: {
          security: [{ OAuth2AuthCode: ['read:users', 'write:users'] }],
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ method: 'GET' }),
      );

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(AUTH0_SCOPE_HEADER)).toBe(
        'read:users write:users',
      );
    });

    it('does not set auth0-scope header when authParams has empty scope array', async () => {
      const mockFetch = stubFetch();
      createMyAccountClient(mockProxyConfig);

      const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
      const fetcher = constructorOptions.fetcher as unknown as (
        args: Record<string, unknown>,
      ) => Promise<unknown>;

      await fetcher({
        url: 'https://example.com',
        method: 'GET',
      });

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(AUTH0_SCOPE_HEADER)).toBeNull();
    });
  });

  describe('SPA mode fetcher', () => {
    it('calls SDK fetchWithAuth with scope from endpoint metadata', async () => {
      createMyAccountClient(createSpaConfig());

      const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
      const fetcher = constructorOptions.fetcher as unknown as (
        args: Record<string, unknown>,
      ) => Promise<unknown>;

      await fetcher({
        url: 'https://example.com',
        method: 'GET',
        endpointMetadata: {
          security: [{ OAuth2AuthCode: ['read:users', 'write:users'] }],
        },
      });

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ method: 'GET' }),
        { scope: ['read:users', 'write:users'] },
      );
    });

    it('handles no endpoint metadata', async () => {
      createMyAccountClient(createSpaConfig());

      const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
      const fetcher = constructorOptions.fetcher as unknown as (
        args: Record<string, unknown>,
      ) => Promise<unknown>;

      await fetcher({
        url: 'https://example.com',
        method: 'GET',
      });

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ method: 'GET' }),
        { scope: undefined },
      );
    });
  });
});
