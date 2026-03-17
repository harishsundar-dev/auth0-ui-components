/**
 * Deprecated OAuth scope constants.
 * @deprecated These constants will be removed in next major version. Scopes are now handled automatically by SDK fetchers.
 * @module scope-constants
 * @internal
 */

/**
 * Required OAuth scopes for user MFA management operations.
 * @deprecated No longer needed. Scopes are automatically handled by the SDK fetcher.
 * @internal
 */
export const USER_MFA_SCOPES =
  'create:me:authentication_methods read:me:authentication_methods delete:me:authentication_methods update:me:authentication_methods read:me:factors';

/**
 * Required OAuth scopes for organization details editing.
 * @deprecated No longer needed. Scopes are automatically handled by the SDK fetcher.
 * @internal
 */
export const MY_ORGANIZATION_DETAILS_EDIT_SCOPES = 'read:my_org:details update:my_org:details';

/**
 * Required OAuth scopes for SSO provider table operations.
 * @deprecated No longer needed. Scopes are automatically handled by the SDK fetcher.
 * @internal
 */
export const MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES =
  'read:my_org:details read:my_org:identity_providers create:my_org:identity_providers update:my_org:identity_providers delete:my_org:identity_providers update:my_org:identity_providers_detach read:my_org:configuration';

/**
 * Required OAuth scopes for creating SSO providers.
 * @deprecated No longer needed. Scopes are automatically handled by the SDK fetcher.
 * @internal
 */
export const MY_ORGANIZATION_SSO_PROVIDER_CREATE_SCOPES =
  'read:my_org:identity_providers create:my_org:identity_providers read:my_org:configuration';

/**
 * Required OAuth scopes for editing SSO providers.
 * @deprecated No longer needed. Scopes are automatically handled by the SDK fetcher.
 * @internal
 */
export const MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES =
  'read:my_org:details update:my_org:details read:my_org:identity_providers create:my_org:identity_providers update:my_org:identity_providers delete:my_org:identity_providers update:my_org:identity_providers_detach read:my_org:identity_providers_provisioning create:my_org:identity_providers_provisioning delete:my_org:identity_providers_provisioning create:my_org:identity_providers_domains delete:my_org:identity_providers_domains read:my_org:identity_providers_scim_tokens create:my_org:identity_providers_scim_tokens delete:my_org:identity_providers_scim_tokens read:my_org:domains delete:my_org:domains create:my_org:domains update:my_org:domains read:my_org:configuration';

/**
 * Required OAuth scopes for domain management operations.
 * @deprecated No longer needed. Scopes are automatically handled by the SDK fetcher.
 * @internal
 */
export const MY_ORGANIZATION_DOMAIN_SCOPES =
  'read:my_org:domains delete:my_org:domains create:my_org:domains update:my_org:domains read:my_org:identity_providers create:my_org:identity_providers_domains delete:my_org:identity_providers_domains';
