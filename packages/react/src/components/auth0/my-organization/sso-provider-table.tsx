/**
 * SSO providers table component.
 *
 * Displays a table of SSO identity providers with actions for creating, editing,
 * enabling/disabling, and deleting providers.
 *
 * @module sso-provider-table
 *
 * @example
 * ```tsx
 * <SsoProviderTable
 *   createAction={{ onAfter: () => navigate('/providers/new') }}
 *   editAction={{ onAfter: (provider) => navigate(`/providers/${provider.id}`) }}
 *   deleteAction={{ onAfter: (provider) => console.log('Deleted:', provider) }}
 * />
 * ```
 */

import {
  getComponentStyles,
  type IdentityProvider,
  STRATEGY_DISPLAY_NAMES,
  MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES,
} from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { SsoProviderDeleteModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-delete/provider-delete-modal';
import { SsoProviderRemoveFromOrganizationModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-remove/provider-remove-modal';
import { SsoProviderTableActionsColumn } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-table/sso-provider-table-action';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Header } from '@/components/auth0/shared/header';
import { withMyOrganizationService } from '@/hoc/with-services';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import { useSsoProviderTable } from '@/hooks/my-organization/use-sso-provider-table';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SsoProviderTableProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

/**
 * Internal SSO provider table component.
 * @param props - Component props
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.createAction - Configuration for the create action
 * @param props.editAction - Configuration for the edit action
 * @param props.deleteAction - Configuration for the delete action
 * @param props.deleteFromOrganizationAction - Configuration for removing from organization
 * @param props.enableProviderAction - Configuration for enabling a provider
 * @returns JSX element
 * @internal
 */
function SsoProviderTableComponent({
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly = false,
  createAction,
  editAction,
  deleteAction,
  deleteFromOrganizationAction,
  enableProviderAction,
}: SsoProviderTableProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('idp_management.sso_provider_table', customMessages);

  const {
    providers,
    isLoading,
    isDeleting,
    isRemoving,
    isUpdating,
    isUpdatingId,
    onDeleteConfirm,
    onRemoveConfirm,
    onEnableProvider,
    organization,
  } = useSsoProviderTable(
    deleteAction,
    deleteFromOrganizationAction,
    enableProviderAction,
    customMessages,
  );
  const { isLoadingConfig, shouldAllowDeletion, isConfigValid } = useConfig();
  const { isLoadingIdpConfig, isIdpConfigValid } = useIdpConfig();

  const shouldHideCreate = !isConfigValid || !isIdpConfigValid;
  const isViewLoading = isLoading || isLoadingConfig || isLoadingIdpConfig;

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showRemoveModal, setShowRemoveModal] = React.useState(false);
  const [selectedIdp, setSelectedIdp] = React.useState<IdentityProvider | null>(null);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleCreate = React.useCallback(() => {
    if (createAction?.onAfter) {
      createAction.onAfter();
    }
  }, [createAction]);

  const handleEdit = React.useCallback(
    (idp: IdentityProvider) => {
      if (editAction?.onAfter) {
        editAction.onAfter(idp);
      }
    },
    [editAction],
  );

  const handleDelete = React.useCallback(
    (idp: IdentityProvider) => {
      setSelectedIdp(idp);

      if (deleteAction?.onBefore) {
        const shouldProceed = deleteAction.onBefore(idp);
        if (!shouldProceed) return;
      }

      setShowDeleteModal(true);
    },
    [deleteAction],
  );

  const handleDeleteFromOrganization = React.useCallback(
    (idp: IdentityProvider) => {
      setSelectedIdp(idp);

      if (deleteFromOrganizationAction?.onBefore) {
        const shouldProceed = deleteFromOrganizationAction.onBefore(idp);
        if (!shouldProceed) return;
      }

      setShowRemoveModal(true);
    },
    [deleteFromOrganizationAction],
  );

  const handleToggleEnabled = React.useCallback(
    async (idp: IdentityProvider, enabled: boolean) => {
      if (readOnly || !onEnableProvider) return;

      await onEnableProvider(idp, enabled);
    },
    [readOnly, onEnableProvider],
  );

  const handleDeleteConfirm = React.useCallback(
    async (provider: IdentityProvider) => {
      await onDeleteConfirm(provider);
      setShowDeleteModal(false);
      setSelectedIdp(null);
    },
    [onDeleteConfirm, selectedIdp],
  );

  const handleRemoveConfirm = React.useCallback(
    async (provider: IdentityProvider) => {
      await onRemoveConfirm(provider);
      setShowRemoveModal(false);
      setSelectedIdp(null);
    },
    [onRemoveConfirm],
  );

  const columns: Column<IdentityProvider>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('table.columns.name'),
        width: '25%',
        render: (idp) => <div className="font-medium text-muted-foreground">{idp.name}</div>,
      },
      {
        type: 'text',
        accessorKey: 'display_name',
        width: '30%',
        title: t('table.columns.display_name'),
        render: (idp) => <div className="text-muted-foreground">{idp.display_name}</div>,
      },
      {
        type: 'text',
        accessorKey: 'strategy',
        title: t('table.columns.identity_provider'),
        width: '25%',
        render: (idp) => (
          <div className="text-muted-foreground">{STRATEGY_DISPLAY_NAMES[idp.strategy]}</div>
        ),
      },
      {
        type: 'actions',
        title: '',
        width: '20%',
        render: (idp) => (
          <SsoProviderTableActionsColumn
            provider={idp}
            shouldAllowDeletion={shouldAllowDeletion}
            readOnly={readOnly}
            isUpdating={isUpdating}
            isUpdatingId={isUpdatingId}
            customMessages={customMessages}
            edit={editAction}
            onToggleEnabled={handleToggleEnabled}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRemoveFromOrganization={handleDeleteFromOrganization}
          />
        ),
      },
    ],
    [
      t,
      readOnly,
      editAction,
      isUpdating,
      handleEdit,
      handleDelete,
      handleDeleteFromOrganization,
      handleToggleEnabled,
    ],
  );

  return (
    <div style={currentStyles.variables}>
      <div className={currentStyles.classes?.['SsoProviderTable-header']}>
        <Header
          title={t('header.title')}
          description={t('header.description')}
          actions={[
            {
              type: 'button',
              label: t('header.create_button_text'),
              onClick: () => handleCreate(),
              icon: Plus,
              hidden: shouldHideCreate || isViewLoading,
              disabled: createAction?.disabled || readOnly,
            },
          ]}
        />
      </div>

      <DataTable
        loading={isViewLoading}
        columns={columns}
        data={providers}
        emptyState={{ title: t('table.empty_message') }}
        className={currentStyles.classes?.['SsoProviderTable-table']}
      />

      {selectedIdp && (
        <SsoProviderDeleteModal
          className={currentStyles.classes?.['SsoProviderTable-deleteProviderModal']}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          provider={selectedIdp}
          onDelete={handleDeleteConfirm}
          isLoading={isDeleting}
          customMessages={customMessages.delete_modal}
        />
      )}

      {selectedIdp && (
        <SsoProviderRemoveFromOrganizationModal
          className={
            currentStyles.classes?.['SsoProviderTable-deleteProviderFromOrganizationModal']
          }
          isOpen={showRemoveModal}
          onClose={() => setShowRemoveModal(false)}
          provider={selectedIdp}
          organizationName={organization?.name}
          onRemove={handleRemoveConfirm}
          isLoading={isRemoving}
          customMessages={customMessages.remove_modal}
        />
      )}
    </div>
  );
}

/**
 * SSO identity providers table.
 *
 * Displays a table of SSO identity providers with actions for creating, editing,
 * enabling/disabling, deleting, and removing providers from the organization.
 *
 * @param customMessages - Custom i18n message overrides
 * @param styling - CSS variables and class overrides
 * @param readOnly - Render in read-only mode
 * @param createAction - Lifecycle hooks for provider creation
 * @param editAction - Lifecycle hooks for provider editing
 * @param deleteAction - Lifecycle hooks for provider deletion
 * @param deleteFromOrganizationAction - Lifecycle hooks for removing provider from organization
 * @param enableProviderAction - Lifecycle hooks for enabling/disabling provider
 * @returns SSO provider table component
 *
 * @example
 * ```tsx
 * <SsoProviderTable
 *   createAction={{ onAfter: () => navigate('/providers/new') }}
 *   editAction={{ onAfter: (provider) => navigate(`/providers/${provider.id}`) }}
 *   deleteAction={{
 *     onBefore: (provider) => confirm(`Delete ${provider.name}?`),
 *     onAfter: (provider) => console.log('Deleted:', provider),
 *   }}
 * />
 * ```
 */
export const SsoProviderTable = withMyOrganizationService(
  SsoProviderTableComponent,
  MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES,
);
