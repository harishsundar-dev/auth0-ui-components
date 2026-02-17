import { getComponentStyles, type Domain } from '@auth0/universal-components-core';
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
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getStatusBadgeVariant } from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import type { DomainTableViewProps } from '@/types';

/**
 * DomainTableView — Presentational component for domain management.
 *
 * Renders the domains table, header, and all associated modals
 * (create, verify, configure providers, delete).
 * Receives data and handlers via `logic` and `api` props.
 */
export function DomainTableView({ logic, api }: DomainTableViewProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('domain_management', logic.customMessages);

  const {
    domains,
    providers,
    isCreating,
    isVerifying,
    isFetching,
    isLoadingProviders,
    isDeleting,
    schema,
    styling,
    hideHeader,
    readOnly = false,
    customMessages,
    createAction,
    onOpenProvider,
    onCreateProvider,
  } = logic;

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
  } = api;

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
            customMessages={logic.customMessages}
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
        customMessages={customMessages?.create}
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
        customMessages={customMessages?.configure}
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
        customMessages={customMessages?.verify}
      />

      <DomainDeleteModal
        className={currentStyles.classes?.['DomainTable-deleteModal']}
        domain={selectedDomain}
        isOpen={showDeleteModal}
        isLoading={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        customMessages={customMessages?.delete}
      />
    </div>
  );
}
