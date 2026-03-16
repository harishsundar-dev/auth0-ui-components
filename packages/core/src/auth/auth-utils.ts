import type { AuthDetails, ClientAuthConfig } from './auth-types';

export const AuthUtils = {
  /**
   * Resolves the appropriate ClientAuthConfig based on provided AuthDetails.
   * @internal
   *
   * @param auth - Authentication configuration details
   * @returns The resolved ClientAuthConfig for proxy or SPA mode
   */
  resolveAuthConfig(auth: AuthDetails): ClientAuthConfig {
    if (auth.authProxyUrl) {
      return {
        mode: 'proxy',
        proxyUrl: auth.authProxyUrl.replace(/\/$/, ''),
        ...(auth.domain && { domain: auth.domain.trim() }),
      };
    }

    const { contextInterface } = auth;

    if (!contextInterface) {
      throw new Error(
        'Initialization failed: Auth0 context not found. Ensure the component is rendered within Auth0ComponentProvider.',
      );
    }

    const domain = auth.domain ?? contextInterface.getConfiguration()?.domain;

    if (!domain) {
      throw new Error(
        'Initialization failed: Auth0 domain is not configured. Provide a domain to Auth0ComponentProvider.',
      );
    }

    return {
      mode: 'spa',
      contextInterface,
      domain: domain.trim(),
    };
  },
};
