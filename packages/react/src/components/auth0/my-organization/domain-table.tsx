/**
 * Domain management table component.
 *
 * Displays organization domains with CRUD operations including create, verify, and delete.
 * Supports associating domains with identity providers.
 *
 * @module domain-table
 *
 * @example
 * ```tsx
 * <DomainTable
 *   createAction={{ onAfter: (domain) => console.log('Created:', domain) }}
 *   verifyAction={{ onAfter: (domain) => console.log('Verified:', domain) }}
 *   deleteAction={{ onAfter: (domain) => console.log('Deleted:', domain) }}
 * />
 * ```
 */

import {
  type Domain,
  getComponentStyles,
  MY_ORGANIZATION_DOMAIN_SCOPES,
} from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { DomainConfigureProvidersModal } from '@/components/auth0/my-organization/shared/domain-management/domain-configure/domain-configure-providers-modal';
import { DomainCreateModal } from '@/components/auth0/my-organization/shared/domain-management/domain-create/domain-create-modal';
import { DomainDeleteModal } from '@/components/auth0/my-organization/shared/domain-management/domain-delete/domain-delete-modal';
import { DomainTableActionsColumn } from '@/components/auth0/my-organization/shared/domain-management/domain-table/domain-table-actions-column';
import { DomainVerifyModal } from '@/components/auth0/my-organization/shared/domain-management/domain-verify/domain-verify-modal';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Header } from '@/components/auth0/shared/header';
import { Badge } from '@/components/ui/badge';
import { withMyOrganizationService } from '@/hoc/with-services';
import { useDomainTable } from '@/hooks/my-organization/use-domain-table';
import { useDomainTableLogic } from '@/hooks/my-organization/use-domain-table-logic';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getStatusBadgeVariant } from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import type { DomainTableProps } from '@/types/my-organization/domain-management/domain-table-types';

/**
 * Internal domain table component.
 * @param props - Component props
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.schema - Zod validation schema
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.hideHeader - Whether to hide the header
 * @param props.readOnly - Whether the component is in read-only mode
 * @returns JSX element
 * @param props.createAction - Configuration for the create action
 * @param props.verifyAction - Configuration for the verify action
 * @param props.deleteAction - Configuration for the delete action
 * @param props.associateToProviderAction - Configuration for associating to a provider
 * @param props.deleteFromProviderAction - Configuration for deleting from a provider
 * @param props.onOpenProvider - Callback fired when opening a provider
 * @param props.onCreateProvider - Callback fired when creating a new provider
 * @internal
 */
function DomainTableComponent({
  customMessages = {},
  schema,
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  hideHeader = false,
  readOnly = false,
  createAction,
  verifyAction,
  deleteAction,
  associateToProviderAction,
  deleteFromProviderAction,
  onOpenProvider,
  onCreateProvider,
}: DomainTableProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('domain_management', customMessages);

  const {
    domains,
    providers,
    isFetching,
    isCreating,
    isVerifying,
    isDeleting,
    isLoadingProviders,
    fetchProviders,
    fetchDomains,
    onCreateDomain,
    onVerifyDomain,
    onDeleteDomain,
    onAssociateToProvider,
    onDeleteFromProvider,
  } = useDomainTable({
    createAction,
    verifyAction,
    deleteAction,
    associateToProviderAction,
    deleteFromProviderAction,
    customMessages,
  });

  const {
    showCreateModal,
    showConfigureModal,
    showVerifyModal,
    showDeleteModal,
    verifyError,
    selectedDomain,
    setShowCreateModal,
    setShowConfigureModal,
    setShowDeleteModal,
    handleCreate,
    handleVerify,
    handleDelete,
    handleToggleSwitch,
    handleCloseVerifyModal,
    handleCreateClick,
    handleConfigureClick,
    handleVerifyClick,
    handleDeleteClick,
  } = useDomainTableLogic({
    t,
    onCreateDomain,
    onVerifyDomain,
    onDeleteDomain,
    onAssociateToProvider,
    onDeleteFromProvider,
    fetchProviders,
    fetchDomains,
  });

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const columns: Column<Domain>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'domain',
        title: t('domain_table.table.columns.domain'),
        width: '35%',
        render: (domain) => <div className="font-medium">{domain.domain}</div>,
      },
      {
        type: 'text',
        accessorKey: 'status',
        title: t('domain_table.table.columns.status'),
        width: '25%',
        render: (domain) => (
          <Badge variant={getStatusBadgeVariant(domain.status)} size={'sm'}>
            {t(`shared.domain_statuses.${domain.status}`)}
          </Badge>
        ),
      },
      {
        type: 'actions',
        title: '',
        width: '20%',
        render: (domain) => (
          <DomainTableActionsColumn
            domain={domain}
            readOnly={readOnly}
            customMessages={customMessages}
            onView={handleConfigureClick}
            onConfigure={handleConfigureClick}
            onVerify={handleVerifyClick}
            onDelete={handleDeleteClick}
          />
        ),
      },
    ],
    [t, readOnly, customMessages, handleConfigureClick, handleVerifyClick, handleDeleteClick],
  );

  return (
    <div style={currentStyles.variables}>
      {!hideHeader && (
        <div className={currentStyles.classes?.['DomainTable-header']}>
          <Header
            title={t('domain_table.header.title')}
            description={t('domain_table.header.description')}
            actions={[
              {
                type: 'button',
                label: t('domain_table.header.create_button_text'),
                onClick: () => handleCreateClick(),
                icon: Plus,
                disabled: createAction?.disabled || readOnly || isFetching,
              },
            ]}
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={domains}
        loading={isFetching}
        emptyState={{ title: t('domain_table.table.empty_message') }}
        className={currentStyles.classes?.['DomainTable-table']}
      />

      <DomainCreateModal
        className={currentStyles.classes?.['DomainTable-createModal']}
        isOpen={showCreateModal}
        isLoading={isCreating}
        schema={schema?.create}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        customMessages={customMessages.create}
      />

      <DomainConfigureProvidersModal
        className={currentStyles.classes?.['DomainTable-configureModal']}
        domain={selectedDomain}
        providers={providers}
        isOpen={showConfigureModal}
        isLoading={isLoadingProviders}
        isLoadingSwitch={false}
        onClose={() => setShowConfigureModal(false)}
        onToggleSwitch={handleToggleSwitch}
        onOpenProvider={onOpenProvider}
        onCreateProvider={onCreateProvider}
        customMessages={customMessages.configure}
      />

      <DomainVerifyModal
        className={currentStyles.classes?.['DomainTable-verifyModal']}
        isOpen={showVerifyModal}
        isLoading={isVerifying}
        domain={selectedDomain}
        error={verifyError}
        onClose={handleCloseVerifyModal}
        onVerify={handleVerify}
        onDelete={handleDeleteClick}
        customMessages={customMessages.verify}
      />

      <DomainDeleteModal
        className={currentStyles.classes?.['DomainTable-deleteModal']}
        domain={selectedDomain}
        isOpen={showDeleteModal}
        isLoading={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        customMessages={customMessages.delete}
      />
    </div>
  );
}

/**
 * Domain management table for organization domains.
 *
 * Displays a table of organization domains with actions for creating, verifying,
 * deleting, and associating domains with identity providers.
 *
 * @param customMessages - Custom i18n message overrides
 * @param schema - Validation schema overrides
 * @param styling - CSS variables and class overrides
 * @param hideHeader - Hide the header section
 * @param readOnly - Render in read-only mode
 * @param createAction - Lifecycle hooks for domain creation
 * @param verifyAction - Lifecycle hooks for domain verification
 * @param deleteAction - Lifecycle hooks for domain deletion
 * @param associateToProviderAction - Lifecycle hooks for provider association
 * @param deleteFromProviderAction - Lifecycle hooks for removing provider association
 * @param onOpenProvider - Callback when opening a provider
 * @param onCreateProvider - Callback when creating a provider
 * @returns Domain table component
 *
 * @example
 * ```tsx
 * <DomainTable
 *   createAction={{
 *     onBefore: () => true,
 *     onAfter: (domain) => console.log('Created:', domain),
 *   }}
 *   verifyAction={{
 *     onAfter: (domain) => console.log('Verified:', domain),
 *   }}
 * />
 * ```
 */
export const DomainTable = withMyOrganizationService(
  DomainTableComponent,
  MY_ORGANIZATION_DOMAIN_SCOPES,
);
