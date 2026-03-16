import { describe, expect, it, vi } from 'vitest';

import { AuthUtils } from '../auth-utils';

const createMockContext = (overrides: object = {}) => ({
  getConfiguration: vi.fn().mockReturnValue({ domain: 'test.auth0.com', clientId: 'test-client' }),
  mfa: {
    getAuthenticators: vi.fn().mockResolvedValue([]),
    enroll: vi.fn().mockResolvedValue({}),
    challenge: vi.fn().mockResolvedValue({}),
    verify: vi.fn().mockResolvedValue({}),
  },
  ...overrides,
});

describe('AuthUtils', () => {
  describe('resolveAuthConfig', () => {
    describe('proxy mode', () => {
      it('returns proxy config when authProxyUrl is set', () => {
        const config = AuthUtils.resolveAuthConfig({ authProxyUrl: 'https://proxy.example.com' });
        expect(config).toEqual({ mode: 'proxy', proxyUrl: 'https://proxy.example.com' });
      });

      it('strips trailing slash from authProxyUrl', () => {
        const config = AuthUtils.resolveAuthConfig({ authProxyUrl: 'https://proxy.example.com/' });
        expect(config).toEqual({ mode: 'proxy', proxyUrl: 'https://proxy.example.com' });
      });

      it('prefers proxy mode when both authProxyUrl and domain are set', () => {
        const config = AuthUtils.resolveAuthConfig({
          authProxyUrl: 'https://proxy.example.com',
          domain: 'test.auth0.com',
          contextInterface: createMockContext(),
        });
        expect(config.mode).toBe('proxy');
      });

      it('includes domain in proxy config when domain is also provided', () => {
        const config = AuthUtils.resolveAuthConfig({
          authProxyUrl: 'https://proxy.example.com',
          domain: 'test.auth0.com',
        });
        expect(config).toEqual({
          mode: 'proxy',
          proxyUrl: 'https://proxy.example.com',
          domain: 'test.auth0.com',
        });
      });

      it('trims whitespace from domain in proxy config', () => {
        const config = AuthUtils.resolveAuthConfig({
          authProxyUrl: 'https://proxy.example.com',
          domain: '  test.auth0.com  ',
        });
        expect(config).toMatchObject({ mode: 'proxy', domain: 'test.auth0.com' });
      });

      it('omits domain from proxy config when domain is not provided', () => {
        const config = AuthUtils.resolveAuthConfig({ authProxyUrl: 'https://proxy.example.com' });
        expect(config).not.toHaveProperty('domain');
      });
    });

    describe('SPA mode', () => {
      it('returns SPA config with domain and contextInterface', () => {
        const context = createMockContext();
        const config = AuthUtils.resolveAuthConfig({
          domain: 'test.auth0.com',
          contextInterface: context,
        });
        expect(config).toEqual({
          mode: 'spa',
          domain: 'test.auth0.com',
          contextInterface: context,
        });
      });

      it('trims whitespace from domain', () => {
        const context = createMockContext();
        const config = AuthUtils.resolveAuthConfig({
          domain: '  test.auth0.com  ',
          contextInterface: context,
        });
        expect(config).toMatchObject({ mode: 'spa', domain: 'test.auth0.com' });
      });

      it('falls back to domain from contextInterface.getConfiguration()', () => {
        const context = createMockContext({
          getConfiguration: vi.fn().mockReturnValue({ domain: 'from-context.auth0.com' }),
        });
        const config = AuthUtils.resolveAuthConfig({ contextInterface: context });
        expect(config).toMatchObject({ mode: 'spa', domain: 'from-context.auth0.com' });
      });

      it('prefers auth.domain over contextInterface.getConfiguration().domain', () => {
        const context = createMockContext({
          getConfiguration: vi.fn().mockReturnValue({ domain: 'from-context.auth0.com' }),
        });
        const config = AuthUtils.resolveAuthConfig({
          domain: 'explicit.auth0.com',
          contextInterface: context,
        });
        expect(config).toMatchObject({ mode: 'spa', domain: 'explicit.auth0.com' });
      });
    });

    describe('errors', () => {
      it('throws when no authProxyUrl and no contextInterface', () => {
        expect(() => AuthUtils.resolveAuthConfig({})).toThrow(
          'Initialization failed: Auth0 context not found. Ensure the component is rendered within Auth0ComponentProvider.',
        );
      });

      it('throws when domain is provided but contextInterface is missing', () => {
        expect(() => AuthUtils.resolveAuthConfig({ domain: 'test.auth0.com' })).toThrow(
          'Initialization failed: Auth0 context not found. Ensure the component is rendered within Auth0ComponentProvider.',
        );
      });

      it('throws when contextInterface exists but domain cannot be resolved', () => {
        const context = createMockContext({
          getConfiguration: vi.fn().mockReturnValue(undefined),
        });
        expect(() => AuthUtils.resolveAuthConfig({ contextInterface: context })).toThrow(
          'Initialization failed: Auth0 domain is not configured. Provide a domain to Auth0ComponentProvider.',
        );
      });
    });
  });
});
