/** @module organization-management */

'use client';

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { DomainTable } from '@/components/auth0/my-organization/domain-table';
import { OrganizationDangerZone } from '@/components/auth0/my-organization/shared/organization-management/organization-delete/organization-danger-zone';
import { OrganizationDeleteModal } from '@/components/auth0/my-organization/shared/organization-management/organization-delete/organization-delete-modal';
import { OrganizationDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/organization-details';
import { SsoProviderTable } from '@/components/auth0/my-organization/sso-provider-table';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganizationDetailsEdit } from '@/hooks/my-organization/use-organization-details-edit';
import { useOrganizationManagement } from '@/hooks/my-organization/use-organization-management';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  OrganizationManagementProps,
  OrganizationManagementViewProps,
} from '@/types/my-organization/organization-management/organization-management-types';

/**
 * Organization management container component.
 * @param props - Component props
 * @param props.schema - Zod validation schema
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.saveAction - Configuration for the save action
 * @param props.cancelAction - Configuration for the cancel action
 * @param props.deleteAction - Configuration for the delete action
 * @param props.hideHeader - Whether to hide the header
 * @param props.defaultTab - The default active tab
 * @returns JSX element
 * @internal
 */
function OrganizationManagementContainer(props: OrganizationManagementProps): React.JSX.Element {
  const {
    schema,
    customMessages = {},
    styling = {
      variables: { common: {}, light: {}, dark: {} },
      classes: {},
    },
    readOnly = false,
    saveAction,
    cancelAction,
    deleteAction,
    hideHeader = false,
    defaultTab = 'settings',
  } = props;

  const { organization, isFetchLoading, formActions } = useOrganizationDetailsEdit({
    saveAction,
    cancelAction,
    readOnly,
    customMessages,
  });

  const management = useOrganizationManagement({
    deleteAction,
    customMessages,
  });

  return (
    <OrganizationManagementView
      organization={organization}
      isFetchLoading={isFetchLoading}
      formActions={formActions}
      schema={schema}
      styling={styling}
      customMessages={customMessages}
      readOnly={readOnly}
      hideHeader={hideHeader}
      defaultTab={defaultTab}
      saveAction={saveAction}
      cancelAction={cancelAction}
      deleteAction={deleteAction}
      management={management}
    />
  );
}

/**
 * Organization management view component.
 * @param props - View props
 * @returns JSX element
 * @internal
 */
function OrganizationManagementView({
  organization,
  isFetchLoading,
  formActions,
  schema,
  styling,
  customMessages,
  readOnly,
  hideHeader,
  defaultTab,
  deleteAction,
  management,
}: OrganizationManagementViewProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('organization_management.organization_management', customMessages);
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  if (isFetchLoading) {
    return (
      <StyledScope style={currentStyles.variables}>
        <div className="flex items-center justify-center min-h-96 w-full">
          <Spinner />
        </div>
      </StyledScope>
    );
  }

  return (
    <StyledScope style={currentStyles.variables}>
      <div className="w-full">
        {!hideHeader && (
          <div className="mb-8">
            <Header
              title={t('header.title', {
                organizationName: organization.display_name || organization.name || '',
              })}
            />
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof defaultTab)}
          className={cn('space-y-10', currentStyles.classes?.OrganizationManagement_Tabs)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings" className="text-sm">
              {t('tabs.settings')}
            </TabsTrigger>
            <TabsTrigger value="sso" className="text-sm">
              {t('tabs.sso')}
            </TabsTrigger>
            <TabsTrigger value="domains" className="text-sm">
              {t('tabs.domains')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <OrganizationDetails
              organization={organization}
              schema={schema?.details}
              customMessages={customMessages?.details}
              styling={styling}
              readOnly={readOnly}
              formActions={formActions}
            />
            {deleteAction && (
              <OrganizationDangerZone
                organization={organization}
                onDeleteClick={management.openDeleteModal}
                readOnly={readOnly}
                customMessages={customMessages?.delete}
              />
            )}
          </TabsContent>

          <TabsContent value="sso">
            <SsoProviderTable readOnly={readOnly} />
          </TabsContent>

          <TabsContent value="domains">
            <DomainTable readOnly={readOnly} />
          </TabsContent>
        </Tabs>

        {deleteAction && (
          <OrganizationDeleteModal
            isOpen={management.isDeleteModalOpen}
            onClose={management.closeDeleteModal}
            organization={organization}
            onDelete={management.handleDeleteConfirm}
            isLoading={management.isDeleting}
            customMessages={customMessages?.delete}
          />
        )}
      </div>
    </StyledScope>
  );
}

/**
 * Organization management component with tabbed interface.
 *
 * Provides a comprehensive organization management UI combining:
 * - Settings tab: Edit organization details and optionally delete the organization
 * - SSO tab: Manage SSO identity providers
 * - Domains tab: Manage organization domains
 *
 * @param props - {@link OrganizationManagementProps}
 * @param props.schema - Validation schema overrides
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Render in read-only mode
 * @param props.saveAction - Lifecycle hooks for save operation
 * @param props.cancelAction - Lifecycle hooks for cancel operation
 * @param props.deleteAction - Lifecycle hooks for delete operation (enables delete UI)
 * @param props.hideHeader - Hide the header section
 * @param props.defaultTab - The initially active tab
 * @returns Organization management component
 *
 * @see {@link OrganizationManagementProps} for full props documentation
 *
 * @example
 * ```tsx
 * <OrganizationManagement
 *   saveAction={{
 *     onAfter: (org) => console.log('Saved:', org),
 *   }}
 *   deleteAction={{
 *     onAfter: () => navigate('/organizations'),
 *   }}
 * />
 * ```
 */
const OrganizationManagement = OrganizationManagementContainer;

export { OrganizationManagement, OrganizationManagementView };
