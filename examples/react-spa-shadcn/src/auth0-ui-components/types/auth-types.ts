import type { AuthDetails } from '@auth0/universal-components-core';
import type * as React from 'react';

import type { I18nOptions } from './i18n-types';
import type { ThemeSettings } from './theme-types';

/**
 * Props for the Auth0ComponentProvider component.
 */
export type Auth0ComponentProviderProps = (
  | {
      mode?: 'direct';
      authContext?: AuthDetails['contextInterface'];
      proxyConfig?: never;
    }
  | { mode: 'proxy'; proxyConfig: { baseUrl: string } }
) & {
  domain?: string;
  i18n?: I18nOptions;
  themeSettings?: ThemeSettings;
  loader?: React.ReactNode;
  previewMode?: boolean;
};

/**
 * Props for the InternalProvider component.
 */
export interface InternalProviderProps {
  i18n?: I18nOptions;
  authDetails: AuthDetails;
}

/**
 * Configuration for Auth0ComponentProvider excluding authentication details.
 */
export type Auth0ComponentConfig = Omit<
  Auth0ComponentProviderProps,
  'domain' | 'mode' | 'proxyConfig' | 'authContext' | 'i18n'
>;
