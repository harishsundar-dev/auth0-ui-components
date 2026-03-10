import type { MyAccountClient } from '@auth0/myaccount-js';
import type { MyOrganizationClient } from '@auth0/myorganization-js';
import { initializeMyAccountClient } from '@core/services/my-account/my-account-api-service';
import { initializeMyOrganizationClient } from '@core/services/my-organization/my-organization-api-service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createI18nService } from '../../i18n';
import { createMockI18nService } from '../../i18n/__mocks__/i18n-service.mocks';
import {
  createMockContextInterface,
  TEST_DOMAIN,
} from '../../internals/__mocks__/shared/api-service.mocks';
import { createMockMyAccountClient } from '../../services/my-account/__tests__/__mocks__/my-account-api-service.mocks';
import { createMockMyOrganizationClient } from '../../services/my-organization/__tests__/__mocks__/my-organization-api-service.mocks';
import type { AuthDetails } from '../auth-types';
import { createCoreClient } from '../core-client';

// Mock the modules
vi.mock('@core/i18n');
vi.mock('@core/services/my-organization/my-organization-api-service');
vi.mock('@core/services/my-account/my-account-api-service');

describe('createCoreClient', () => {
  // Create mock instances using mock utilities
  const mockI18nService = createMockI18nService();
  const mockMyOrganizationClient = createMockMyOrganizationClient();
  const mockMyAccountClient = createMockMyAccountClient();

  // Get the mocked functions
  const createI18nServiceMock = vi.mocked(createI18nService);
  const initializeMyOrganizationClientMock = vi.mocked(initializeMyOrganizationClient);
  const initializeMyAccountClientMock = vi.mocked(initializeMyAccountClient);

  const createAuthDetails = (overrides: Partial<AuthDetails> = {}): AuthDetails => {
    return {
      domain: TEST_DOMAIN,
      authProxyUrl: undefined,
      contextInterface: createMockContextInterface(),
      ...overrides,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    createI18nServiceMock.mockResolvedValue(mockI18nService);
    initializeMyOrganizationClientMock.mockReturnValue(mockMyOrganizationClient);
    initializeMyAccountClientMock.mockReturnValue(mockMyAccountClient);
  });

  describe('i18n initialization', () => {
    it('initializes i18n with default options when none are provided', async () => {
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails);

      expect(createI18nServiceMock).toHaveBeenCalledWith({
        currentLanguage: 'en-US',
        fallbackLanguage: 'en-US',
      });
    });

    it('initializes i18n with provided language options', async () => {
      const i18nOptions = { currentLanguage: 'es', fallbackLanguage: 'en' };
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails, i18nOptions);

      expect(createI18nServiceMock).toHaveBeenCalledWith(i18nOptions);
    });

    it('exposes i18nService on the client', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.i18nService).toBe(mockI18nService);
    });
  });

  describe('isProxyMode', () => {
    it('returns false when authProxyUrl is undefined', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.isProxyMode()).toBe(false);
    });

    it('returns true when authProxyUrl is set', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.auth0.com' });
      const client = await createCoreClient(authDetails);

      expect(client.isProxyMode()).toBe(true);
    });

    it('returns false when authProxyUrl is empty string', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: '' });
      const client = await createCoreClient(authDetails);

      expect(client.isProxyMode()).toBe(false);
    });
  });

  describe('ensureScopes - proxy mode', () => {
    it('sets org scopes without token fetch in proxy mode', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.auth0.com' });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:org', 'my-org');

      expect(mockMyOrganizationClient.setLatestScopes).toHaveBeenCalledWith('read:org');
      expect(authDetails.contextInterface?.getAccessTokenSilently).not.toHaveBeenCalled();
    });

    it('sets account scopes without token fetch in proxy mode', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.auth0.com' });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:me', 'me');

      expect(mockMyAccountClient.setLatestScopes).toHaveBeenCalledWith('read:me');
      expect(authDetails.contextInterface?.getAccessTokenSilently).not.toHaveBeenCalled();
    });

    it('does not set scopes for unknown audience in proxy mode', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.auth0.com' });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:something', 'unknown-audience');

      expect(mockMyOrganizationClient.setLatestScopes).not.toHaveBeenCalled();
      expect(mockMyAccountClient.setLatestScopes).not.toHaveBeenCalled();
      expect(authDetails.contextInterface?.getAccessTokenSilently).not.toHaveBeenCalled();
    });
  });

  describe('ensureScopes - non-proxy mode', () => {
    it('throws when domain is missing in non-proxy mode', async () => {
      const authDetails = createAuthDetails({ domain: '', contextInterface: undefined });

      await expect(createCoreClient(authDetails)).rejects.toThrow(
        'Initialization failed: Auth0 context not found. Ensure the component is rendered within Auth0ComponentProvider.',
      );
    });

    it('uses domain from contextInterface.getConfiguration() when auth.domain is undefined', async () => {
      const mockContext = {
        ...createMockContextInterface(),
        getConfiguration: vi
          .fn()
          .mockReturnValue({ domain: 'context.auth0.com', clientId: 'test-client-id' }),
      };
      const authDetails = createAuthDetails({ domain: undefined, contextInterface: mockContext });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:org', 'my-org');

      expect(mockMyOrganizationClient.setLatestScopes).toHaveBeenCalledWith('read:org');
      expect(mockContext.getAccessTokenSilently).toHaveBeenCalled();
    });

    it('prefers auth.domain over contextInterface.getConfiguration().domain', async () => {
      const mockContext = {
        ...createMockContextInterface(),
        getConfiguration: vi
          .fn()
          .mockReturnValue({ domain: 'context.auth0.com', clientId: 'test-client-id' }),
      };
      const authDetails = createAuthDetails({
        domain: 'explicit.auth0.com',
        contextInterface: mockContext,
      });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:org', 'my-org');

      expect(mockMyOrganizationClient.setLatestScopes).toHaveBeenCalledWith('read:org');
      expect(mockContext.getAccessTokenSilently).toHaveBeenCalled();
    });

    it('throws when contextInterface.getConfiguration() returns undefined domain', async () => {
      const mockContext = {
        ...createMockContextInterface(),
        getConfiguration: vi.fn().mockReturnValue({ clientId: 'test-client-id' }),
      };
      const authDetails = createAuthDetails({ domain: undefined, contextInterface: mockContext });

      await expect(createCoreClient(authDetails)).rejects.toThrow(
        'Initialization failed: Auth0 domain is not configured. Provide a domain to Auth0ComponentProvider.',
      );
    });

    it('throws when contextInterface.getConfiguration() returns undefined', async () => {
      const mockContext = {
        ...createMockContextInterface(),
        getConfiguration: vi.fn().mockReturnValue(undefined),
      };
      const authDetails = createAuthDetails({ domain: undefined, contextInterface: mockContext });

      await expect(createCoreClient(authDetails)).rejects.toThrow(
        'Initialization failed: Auth0 domain is not configured. Provide a domain to Auth0ComponentProvider.',
      );
    });

    it('throws when contextInterface is undefined and domain is not provided', async () => {
      const authDetails = createAuthDetails({ domain: undefined, contextInterface: undefined });

      await expect(createCoreClient(authDetails)).rejects.toThrow(
        'Initialization failed: Auth0 context not found. Ensure the component is rendered within Auth0ComponentProvider.',
      );
    });

    it('sets org scopes and fetches token in non-proxy mode', async () => {
      const mockContext = createMockContextInterface();
      const authDetails = createAuthDetails({ contextInterface: mockContext });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:org', 'my-org');

      expect(mockMyOrganizationClient.setLatestScopes).toHaveBeenCalledWith('read:org');
      expect(mockContext.getAccessTokenSilently).toHaveBeenCalledWith(
        expect.objectContaining({
          authorizationParams: expect.objectContaining({ scope: 'read:org' }),
          cacheMode: 'off',
        }),
      );
    });

    it('sets account scopes and fetches token in non-proxy mode', async () => {
      const mockContext = createMockContextInterface();
      const authDetails = createAuthDetails({ contextInterface: mockContext });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:me', 'me');

      expect(mockMyAccountClient.setLatestScopes).toHaveBeenCalledWith('read:me');
      expect(mockContext.getAccessTokenSilently).toHaveBeenCalledWith(
        expect.objectContaining({
          authorizationParams: expect.objectContaining({ scope: 'read:me' }),
          cacheMode: 'off',
        }),
      );
    });

    it('throws when token retrieval returns empty access_token in non-proxy mode', async () => {
      const mockContext = createMockContextInterface();
      vi.mocked(mockContext.getAccessTokenSilently).mockResolvedValue({
        access_token: '',
        id_token: '',
        expires_in: 3600,
      });
      const authDetails = createAuthDetails({ contextInterface: mockContext });
      const client = await createCoreClient(authDetails);

      await expect(client.ensureScopes('read:me', 'me')).rejects.toThrow(
        'Failed to retrieve token for audience: me',
      );
    });

    it('does not set scopes for unknown audience in non-proxy mode', async () => {
      const mockContext = createMockContextInterface();
      const authDetails = createAuthDetails({ contextInterface: mockContext });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:something', 'unknown-audience');

      expect(mockMyOrganizationClient.setLatestScopes).not.toHaveBeenCalled();
      expect(mockMyAccountClient.setLatestScopes).not.toHaveBeenCalled();
      expect(mockContext.getAccessTokenSilently).toHaveBeenCalled();
    });
  });

  describe('API client initialization', () => {
    it('initializes MyOrg client with auth details', async () => {
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails);

      expect(initializeMyOrganizationClientMock).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'spa', domain: TEST_DOMAIN }),
      );
    });

    it('initializes MyAccount client with auth details', async () => {
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails);

      expect(initializeMyAccountClientMock).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'spa', domain: TEST_DOMAIN }),
      );
    });
  });

  describe('API client access', () => {
    it('exposes myAccountApiClient directly on the client', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.myAccountApiClient).toBe(mockMyAccountClient.client);
    });

    it('exposes myOrganizationApiClient directly on the client', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.myOrganizationApiClient).toBe(mockMyOrganizationClient.client);
    });

    it('returns myAccountApiClient when available via getter', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.getMyAccountApiClient()).toBe(mockMyAccountClient.client);
    });

    it('returns myOrganizationApiClient when available via getter', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.getMyOrganizationApiClient()).toBe(mockMyOrganizationClient.client);
    });

    it('throws when myAccountApiClient is not available', async () => {
      initializeMyAccountClientMock.mockReturnValueOnce({
        client: undefined as unknown as MyAccountClient,
        setLatestScopes: vi.fn(),
      });

      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyAccountApiClient()).toThrow(
        'myAccountApiClient is not enabled. Please use it within Auth0ComponentProvider.',
      );
    });

    it('throws when myOrganizationApiClient is not available', async () => {
      initializeMyOrganizationClientMock.mockReturnValueOnce({
        client: undefined as unknown as MyOrganizationClient,
        setLatestScopes: vi.fn(),
      });
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyOrganizationApiClient()).toThrow(
        'myOrganizationApiClient is not enabled. Please ensure you are in an Auth0 Organization context.',
      );
    });
  });

  describe('client properties', () => {
    it('exposes auth details on the client', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.auth).toEqual(authDetails);
    });

    it('preserves authProxyUrl in auth details', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://custom-proxy.com' });
      const client = await createCoreClient(authDetails);

      expect(client.auth.authProxyUrl).toBe('https://custom-proxy.com');
    });

    it('preserves contextInterface in auth details', async () => {
      const customContext = createMockContextInterface();
      const authDetails = createAuthDetails({ contextInterface: customContext });
      const client = await createCoreClient(authDetails);

      expect(client.auth.contextInterface).toBe(customContext);
    });
  });

  describe('previewMode', () => {
    it('returns a core client with previewMode and disables API clients', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(client.auth).toEqual({});
      expect(client.myAccountApiClient).toBeUndefined();
      expect(client.myOrganizationApiClient).toBeUndefined();
      expect(typeof client.ensureScopes).toBe('function');
      expect(typeof client.isProxyMode).toBe('function');
    });

    it('isProxyMode returns false in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(client.isProxyMode()).toBe(false);
    });

    it('getMyAccountApiClient throws in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyAccountApiClient()).toThrow('Function not implemented.');
    });

    it('getMyOrganizationApiClient throws in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyOrganizationApiClient()).toThrow('Function not implemented.');
    });

    it('getDomain returns undefined in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(client.getDomain()).toBeUndefined();
    });
  });
});
