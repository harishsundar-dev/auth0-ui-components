/**
 * SSO provider edit component with tabs.
 *
 * Tabbed interface for editing SSO provider settings, managing domains,
 * and configuring SCIM provisioning.
 *
 * @module sso-provider-edit
 *
 * @example
 * ```tsx
 * <SsoProviderEdit
 *   providerId="con_abc123"
 *   sso={{
 *     saveAction: { onAfter: (provider) => console.log('Saved:', provider) },
 *     deleteAction: { onAfter: () => navigate('/providers') },
 *   }}
 *   provisioning={{
 *     createAction: { onAfter: (config) => console.log('Created:', config) },
 *   }}
 * />
 * ```
 */

'use client';

import {
  getComponentStyles,
  MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES,
} from '@auth0/universal-components-core';
import React, { useState } from 'react';

import { SsoDomainTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-domain-tab';
import { SsoProviderTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-tab';
import { SsoProvisioningTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-tab';
import { Header } from '@/components/auth0/shared/header';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withMyOrganizationService } from '@/hoc/with-services';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import { useSsoProviderEdit } from '@/hooks/my-organization/use-sso-provider-edit';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { SsoProviderEditProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

/**
 * Internal SSO provider edit component.
 * @param props - Component props
 * @param props.providerId - ID of the SSO provider
 * @param props.backButton - Configuration for the back button
 * @param props.sso - SSO configuration
 * @param props.provisioning - Provisioning configuration
 * @param props.domains - Array of domains
 * @param props.hideHeader - Whether to hide the header
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.schema - Zod validation schema
 * @param props.readOnly - Whether the component is in read-only mode
 * @internal
 * @returns JSX element
 */
export function SsoProviderEditComponent({
  providerId,
  backButton,
  sso,
  provisioning,
  domains,
  hideHeader = false,
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  schema,
  readOnly = false,
}: SsoProviderEditProps) {
  const { t } = useTranslator('idp_management.edit_sso_provider', customMessages);
  const { isDarkMode } = useTheme();

  const {
    provider,
    organization,
    isLoading,
    isUpdating,
    isDeleting,
    isRemoving,
    isProvisioningUpdating,
    isProvisioningDeleting,
    isScimTokensLoading,
    isScimTokenCreating,
    isScimTokenDeleting,
    isSsoAttributesSyncing,
    isProvisioningAttributesSyncing,
    hasSsoAttributeSyncWarning,
    hasProvisioningAttributeSyncWarning,
    updateProvider,
    createProvisioning: createProvisioningAction,
    deleteProvisioning: deleteProvisioningAction,
    listScimTokens,
    createScimToken: createScimTokenAction,
    deleteScimToken: deleteScimTokenAction,
    syncSsoAttributes,
    syncProvisioningAttributes,
    onDeleteConfirm,
    onRemoveConfirm,
  } = useSsoProviderEdit(providerId, {
    sso,
    provisioning,
    domains,
    customMessages,
  });
  const { shouldAllowDeletion, isLoadingConfig } = useConfig();
  const { idpConfig, isLoadingIdpConfig, isProvisioningEnabled, isProvisioningMethodEnabled } =
    useIdpConfig();

  const showProvisioningTab =
    isProvisioningEnabled(provider?.strategy) && isProvisioningMethodEnabled(provider?.strategy);

  const [activeTab, setActiveTab] = useState('sso');

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleToggleProvider = async (enabled: boolean) => {
    if (!provider?.strategy) return;

    await updateProvider({
      strategy: provider.strategy,
      is_enabled: enabled,
    });
  };

  if (isLoading || isLoadingConfig || isLoadingIdpConfig) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div style={currentStyles.variables} className="w-full">
      {!hideHeader && (
        <Header
          title={provider?.display_name || provider?.name || ''}
          backButton={
            backButton && {
              ...backButton,
              text: t('header.back_button_text'),
            }
          }
          isLoading={isUpdating}
          actions={[
            {
              type: 'switch',
              checked: provider?.is_enabled ?? false,
              onCheckedChange: handleToggleProvider,
              disabled: isUpdating,
              tooltip: {
                content: provider?.is_enabled
                  ? t('header.disable_provider_tooltip_text')
                  : t('header.enable_provider_tooltip_text'),
              },
            },
          ]}
          className={currentStyles?.classes?.['SsoProviderEdit-header']}
        />
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className={cn('space-y-10', currentStyles?.classes?.['SsoProviderEdit-tabs'])}
      >
        <TabsList
          className={cn('grid w-full', showProvisioningTab ? 'grid-cols-3' : 'grid-cols-2')}
        >
          <TabsTrigger value="sso" className="text-sm">
            {t('tabs.sso.name')}
          </TabsTrigger>
          {showProvisioningTab && (
            <TabsTrigger value="provisioning" className="text-sm">
              {t('tabs.provisioning.name')}
            </TabsTrigger>
          )}
          <TabsTrigger value="domain" className="text-sm">
            {t('tabs.domains.name')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sso">
          <SsoProviderTab
            provider={provider}
            organization={organization}
            onDelete={onDeleteConfirm}
            onRemove={onRemoveConfirm}
            isDeleting={isDeleting}
            isRemoving={isRemoving}
            idpConfig={idpConfig}
            shouldAllowDeletion={shouldAllowDeletion}
            hasSsoAttributeSyncWarning={hasSsoAttributeSyncWarning}
            onAttributeSync={syncSsoAttributes}
            isSyncingAttributes={isSsoAttributesSyncing}
            customMessages={customMessages.tabs?.sso?.content}
            styling={styling}
            formActions={{
              isLoading: isUpdating,
              nextAction: {
                disabled: isUpdating || !provider || isLoading,
                onClick: updateProvider,
              },
            }}
            readOnly={readOnly}
          />
        </TabsContent>

        {showProvisioningTab && (
          <TabsContent value="provisioning">
            <SsoProvisioningTab
              provider={provider!}
              isProvisioningUpdating={isProvisioningUpdating}
              isProvisioningDeleting={isProvisioningDeleting}
              isScimTokensLoading={isScimTokensLoading}
              isScimTokenCreating={isScimTokenCreating}
              isScimTokenDeleting={isScimTokenDeleting}
              hasProvisioningAttributeSyncWarning={hasProvisioningAttributeSyncWarning}
              onAttributeSync={syncProvisioningAttributes}
              isSyncingAttributes={isProvisioningAttributesSyncing}
              onCreateProvisioning={createProvisioningAction}
              onDeleteProvisioning={deleteProvisioningAction}
              onListScimTokens={listScimTokens}
              onCreateScimToken={createScimTokenAction}
              onDeleteScimToken={deleteScimTokenAction}
              customMessages={customMessages.tabs?.provisioning?.content}
              styling={styling}
            />
          </TabsContent>
        )}

        <TabsContent value="domain">
          <SsoDomainTab
            customMessages={customMessages.tabs?.domains?.content}
            styling={styling}
            domains={domains}
            schema={schema?.domains}
            idpId={providerId}
            provider={provider}
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * SSO provider edit interface with tabbed navigation.
 *
 * Provides a complete interface for editing SSO provider settings including:
 * - SSO tab: Provider configuration, attribute mappings, delete/remove actions
 * - Provisioning tab: SCIM configuration and token management
 * - Domains tab: Domain association and verification
 *
 * @param providerId - Identity provider ID to edit
 * @param backButton - Back button configuration
 * @param sso - SSO tab lifecycle hooks (save, delete, remove actions)
 * @param provisioning - Provisioning tab lifecycle hooks
 * @param domains - Domains tab configuration
 * @param hideHeader - Hide the header section
 * @param customMessages - Custom i18n message overrides
 * @param styling - CSS variables and class overrides
 * @param schema - Validation schema overrides
 * @param readOnly - Render in read-only mode
 * @returns SSO provider edit component
 *
 * @example
 * ```tsx
 * <SsoProviderEdit
 *   providerId="con_abc123"
 *   sso={{
 *     saveAction: { onAfter: (provider) => console.log('Saved:', provider) },
 *     deleteAction: { onAfter: () => navigate('/providers') },
 *   }}
 *   backButton={{
 *     onClick: () => navigate('/providers'),
 *   }}
 * />
 * ```
 */
export const SsoProviderEdit = withMyOrganizationService(
  SsoProviderEditComponent,
  MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES,
);
