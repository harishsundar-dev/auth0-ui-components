/** @module member-management */

import { type OrganizationPrivate, getComponentStyles } from '@auth0/universal-components-core';
import { Pencil } from 'lucide-react';
import * as React from 'react';

import { DomainTable } from '@/components/auth0/my-organization/domain-table';
import { OrganizationDetailsEdit } from '@/components/auth0/my-organization/organization-details-edit';
import { SsoProviderTable } from '@/components/auth0/my-organization/sso-provider-table';
import { type Column, DataTable } from '@/components/auth0/shared/data-table';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganizationDetailsEdit } from '@/hooks/my-organization/use-organization-details-edit';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  MemberManagementProps,
  MemberManagementActiveView,
  MemberManagementViewProps,
} from '@/types/my-organization/organization-management/member-management-types';

/**
 * MemberManagement container component.
 * @param props - Component props
 * @returns JSX element
 * @internal
 */
function MemberManagementContainer(props: MemberManagementProps): React.JSX.Element {
  const {
    schema,
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    readOnly = false,
    saveAction,
    cancelAction,
    ssoProviders,
    domains,
  } = props;

  const [view, setView] = React.useState<MemberManagementActiveView>('list');
  const [activeTab, setActiveTab] = React.useState('details');

  const { organization, isFetchLoading } = useOrganizationDetailsEdit({
    saveAction,
    cancelAction,
    readOnly,
    customMessages: customMessages?.details,
  });

  const handleEdit = React.useCallback(() => {
    setView('edit');
    setActiveTab('details');
  }, []);

  const handleBack = React.useCallback(() => {
    setView('list');
  }, []);

  const handleTabChange = React.useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  return (
    <MemberManagementView
      organization={organization}
      isFetchLoading={isFetchLoading}
      view={view}
      activeTab={activeTab}
      styling={styling}
      customMessages={customMessages}
      readOnly={readOnly}
      schema={schema}
      ssoProviders={ssoProviders}
      domains={domains}
      saveAction={saveAction}
      cancelAction={cancelAction}
      onEdit={handleEdit}
      onBack={handleBack}
      onTabChange={handleTabChange}
    />
  );
}

/**
 * MemberManagement view component.
 * @param props - Component props
 * @returns JSX element
 * @internal
 */
function MemberManagementView({
  organization,
  isFetchLoading,
  view,
  activeTab,
  styling,
  customMessages,
  readOnly,
  schema,
  ssoProviders,
  domains,
  saveAction,
  cancelAction,
  onEdit,
  onBack,
  onTabChange,
}: MemberManagementViewProps): React.JSX.Element {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('organization_management.member_management', customMessages);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const hasOrganization = !!organization.name;

  const columns: Column<OrganizationPrivate>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('table.columns.name'),
        width: '35%',
        render: (org) => <div className="font-medium">{org.name}</div>,
      },
      {
        type: 'text',
        accessorKey: 'display_name',
        title: t('table.columns.display_name'),
        width: '40%',
        render: (org) => <div className="text-muted-foreground">{org.display_name}</div>,
      },
      {
        type: 'actions',
        title: t('table.columns.actions'),
        width: '25%',
        render: () => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={readOnly}
              aria-label={t('actions.edit')}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{t('actions.edit')}</span>
            </Button>
          </div>
        ),
      },
    ],
    [t, readOnly, onEdit],
  );

  // Only show full-page spinner on initial load (when no data available yet)
  if (isFetchLoading && !organization.name) {
    return (
      <StyledScope style={currentStyles.variables}>
        <div className="flex items-center justify-center min-h-48 w-full">
          <Spinner />
        </div>
      </StyledScope>
    );
  }

  if (view === 'edit') {
    return (
      <StyledScope style={currentStyles.variables}>
        <Tabs
          value={activeTab}
          onValueChange={onTabChange}
          className={cn('space-y-8', currentStyles.classes?.['MemberManagement-tabs'])}
        >
          <div className="mb-4">
            <Button
              variant="link"
              onClick={onBack}
              size="default"
              className="flex items-center text-sm mb-3 px-0"
              data-testid="member-management-back-button"
            >
              <span>← {t('header.title')}</span>
            </Button>
          </div>

          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="text-sm">
              {t('tabs.details')}
            </TabsTrigger>
            <TabsTrigger value="sso_providers" className="text-sm">
              {t('tabs.sso_providers')}
            </TabsTrigger>
            <TabsTrigger value="domains" className="text-sm">
              {t('tabs.domains')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <OrganizationDetailsEdit
              schema={schema?.details}
              customMessages={customMessages?.details}
              styling={{ variables: styling?.variables }}
              readOnly={readOnly}
              hideHeader
              saveAction={saveAction}
              cancelAction={cancelAction}
            />
          </TabsContent>

          <TabsContent value="sso_providers">
            <SsoProviderTable
              styling={{ variables: styling?.variables }}
              readOnly={readOnly}
              createAction={ssoProviders?.createAction ?? { disabled: readOnly }}
              editAction={ssoProviders?.editAction ?? { disabled: readOnly }}
              deleteAction={ssoProviders?.deleteAction}
              deleteFromOrganizationAction={ssoProviders?.deleteFromOrganizationAction}
              enableProviderAction={ssoProviders?.enableProviderAction}
            />
          </TabsContent>

          <TabsContent value="domains">
            <DomainTable
              schema={schema?.domains}
              styling={{ variables: styling?.variables }}
              readOnly={readOnly}
              createAction={domains?.createAction}
              verifyAction={domains?.verifyAction}
              deleteAction={domains?.deleteAction}
              associateToProviderAction={domains?.associateToProviderAction}
              deleteFromProviderAction={domains?.deleteFromProviderAction}
              onOpenProvider={domains?.onOpenProvider}
              onCreateProvider={domains?.onCreateProvider}
            />
          </TabsContent>
        </Tabs>
      </StyledScope>
    );
  }

  // List view
  return (
    <StyledScope style={currentStyles.variables}>
      <div className={currentStyles.classes?.['MemberManagement-header']}>
        <Header title={t('header.title')} />
      </div>

      {hasOrganization ? (
        <DataTable
          columns={columns}
          data={[organization]}
          loading={false}
          className={currentStyles.classes?.['MemberManagement-table']}
        />
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center min-h-48 space-y-4 text-center',
            currentStyles.classes?.['MemberManagement-emptyState'],
          )}
          data-testid="member-management-empty-state"
        >
          <p className="text-lg font-medium text-foreground">{t('empty_state.title')}</p>
          <p className="text-sm text-muted-foreground">{t('empty_state.description')}</p>
        </div>
      )}
    </StyledScope>
  );
}

/**
 * Organization settings management dashboard.
 *
 * A high-level component for managing an organization's configuration including
 * details, SSO providers, and domain management. Provides a tabbed interface
 * for navigation between the different configuration sections.
 *
 * @param props - {@link MemberManagementProps}
 * @param props.schema - Validation schema overrides
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Render in read-only mode
 * @param props.saveAction - Lifecycle hooks for save operation
 * @param props.cancelAction - Lifecycle hooks for cancel operation
 * @param props.ssoProviders - SSO provider action configuration
 * @param props.domains - Domain management action configuration
 * @returns Member management component
 *
 * @see {@link MemberManagementProps} for full props documentation
 *
 * @example
 * ```tsx
 * <MemberManagement
 *   saveAction={{
 *     onBefore: () => true,
 *     onAfter: (org) => console.log('Saved:', org),
 *   }}
 *   ssoProviders={{
 *     createAction: { onAfter: () => navigate('/providers/new') },
 *     editAction: { onAfter: (provider) => navigate(`/providers/${provider.id}`) },
 *   }}
 *   domains={{
 *     createAction: { onAfter: (domain) => console.log('Created:', domain) },
 *   }}
 * />
 * ```
 */
const MemberManagement = MemberManagementContainer;

export { MemberManagement, MemberManagementView };
