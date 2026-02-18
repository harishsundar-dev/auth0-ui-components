/**
 * HOC for OAuth scope registration and authorization.
 * @module with-services
 * @internal
 */

import * as React from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useScopeManager } from '@/hooks/shared/use-scope-manager';
import { useTheme } from '@/hooks/shared/use-theme';

/** Required API scopes configuration. */
export interface ServiceRequirements {
  myAccountApiScopes?: string;
  myOrganizationApiScopes?: string;
}

/**
 * Checks if required scopes are satisfied by ensured scopes.
 * @param required
 * @param ensured
 * @internal
 */
function scopesSatisfied(required: string, ensured: string) {
  if (!required) return true;
  const requiredSet = required.split(' ').filter(Boolean);
  const ensuredSet = new Set(ensured.split(' ').filter(Boolean));
  return requiredSet.every((scope) => ensuredSet.has(scope));
}

/**
 * Normalizes scope string (sorts, dedupes, trims).
 * @param scopes
 * @internal
 */
function normalizeScopes(scopes?: string) {
  return scopes
    ? scopes
        .split(' ')
        .map((s) => s.trim())
        .filter(Boolean)
        .sort()
        .join(' ')
    : '';
}

/**
 * HOC that registers OAuth scopes and shows loader until authorized.
 * @param WrappedComponent - Component to wrap.
 * @param requirements - Required API scopes.
 * @returns Wrapped component with scope handling.
 * @internal
 */
export function withServices<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requirements: ServiceRequirements = {},
): React.ComponentType<P> {
  const WithServicesComponent = (props: P) => {
    const { loader } = useTheme();
    const { registerScopes, ensured } = useScopeManager();
    const defaultLoader = (
      <div className="fixed inset-0 flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );

    const requiredMe = normalizeScopes(requirements.myAccountApiScopes);
    const requiredOrganization = normalizeScopes(requirements.myOrganizationApiScopes);

    const meEnsured = scopesSatisfied(requiredMe, ensured.me);
    const organizationEnsured = scopesSatisfied(requiredOrganization, ensured['my-org']);

    React.useEffect(() => {
      if (requirements.myAccountApiScopes) {
        registerScopes('me', requirements.myAccountApiScopes);
      }
      if (requirements.myOrganizationApiScopes) {
        registerScopes('my-org', requirements.myOrganizationApiScopes);
      }
    }, [requirements.myAccountApiScopes, requirements.myOrganizationApiScopes, registerScopes]);

    if (
      (requirements.myAccountApiScopes && !meEnsured) ||
      (requirements.myOrganizationApiScopes && !organizationEnsured)
    ) {
      return <>{loader || defaultLoader}</>;
    }

    return <WrappedComponent {...props} />;
  };

  return WithServicesComponent;
}

/**
 * HOC for my-organization API scope authorization.
 * @param WrappedComponent - Component to wrap.
 * @param scopes - Required my-organization API scopes.
 * @returns Wrapped component.
 * @internal
 */
export function withMyOrganizationService<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  scopes: string,
): React.ComponentType<P> {
  return withServices(WrappedComponent, { myOrganizationApiScopes: scopes });
}

/**
 * HOC for my-account API scope authorization.
 * @param WrappedComponent - Component to wrap.
 * @param scopes - Required my-account API scopes.
 * @returns Wrapped component.
 * @internal
 */
export function withMyAccountService<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  scopes: string,
): React.ComponentType<P> {
  return withServices(WrappedComponent, { myAccountApiScopes: scopes });
}
