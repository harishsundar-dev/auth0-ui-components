/**
 * My Organization API service initialization.
 * @module my-organization-api-service
 * @internal
 */

import { MyOrganizationClient } from '@auth0/myorganization-js';
import { buildBaseHeaders, buildServiceConfig } from '@core/api/api-utils';
import type { ClientAuthConfig } from '@core/auth/auth-types';

import type { OrganizationPrivate } from './organization-management/organization-details-types';

/**
 * API interface for multi-organization management operations.
 * @internal
 */
export interface OrganizationManagementApi {
  list(): Promise<OrganizationPrivate[]>;
  get(params: { organizationId: string }): Promise<OrganizationPrivate>;
  create(body: Omit<OrganizationPrivate, 'id'>): Promise<OrganizationPrivate>;
  update(params: {
    organizationId: string;
    body: Omit<OrganizationPrivate, 'id'>;
  }): Promise<OrganizationPrivate>;
  delete(params: { organizationId: string }): Promise<void>;
}

export type MyOrganizationApiClient = {
  withScopes(scopes: string): MyOrganizationApiClient;
  readonly organization: MyOrganizationClient['organization'];
  readonly organizationDetails: MyOrganizationClient['organizationDetails'];
  readonly organizations: OrganizationManagementApi;
};

/**
 * Initializes the My Organization API client for organization, SSO, and domain operations.
 * @internal
 *
 * @param config - Auth configuration — either proxy or domain mode
 * @returns My Organization API client with withScopes chaining
 */
export function initializeMyOrganizationClient(config: ClientAuthConfig): MyOrganizationApiClient {
  const { sdkConfig, authHeaders } = buildServiceConfig(config, 'my-org');

  const createInstance = (scopes = ''): MyOrganizationApiClient => {
    const rawClient = new MyOrganizationClient({
      ...sdkConfig,
      fetcher: async (url: string, init?: RequestInit) => {
        const headers = buildBaseHeaders(init);
        await authHeaders(headers, scopes);
        return fetch(url, { ...init, headers });
      },
    });

    // Access the SDK's organizations API if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawOrganizationsApi = (rawClient as any).organizations as
      | OrganizationManagementApi
      | undefined;

    return {
      withScopes: (newScopes: string): MyOrganizationApiClient => createInstance(newScopes),
      get organization() {
        return rawClient.organization;
      },
      get organizationDetails() {
        return rawClient.organizationDetails;
      },
      get organizations() {
        if (!rawOrganizationsApi) {
          const notSupported = (): never => {
            throw new Error(
              'organizations API is not supported by the current SDK version. Please upgrade @auth0/myorganization-js.',
            );
          };
          return {
            list: notSupported,
            get: notSupported,
            create: notSupported,
            update: notSupported,
            delete: notSupported,
          };
        }
        return rawOrganizationsApi;
      },
    };
  };

  return createInstance();
}
