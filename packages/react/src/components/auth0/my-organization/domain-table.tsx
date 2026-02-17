import { MY_ORGANIZATION_DOMAIN_SCOPES } from '@auth0/universal-components-core';

import { DomainTableView } from '@/components/auth0/my-organization/domain-table-view';
import { withMyOrganizationService } from '@/hoc/with-services';
import { useDomainTable } from '@/hooks/my-organization/use-domain-table';
import { useDomainTableLogic } from '@/hooks/my-organization/use-domain-table-logic';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { DomainTableProps } from '@/types/my-organization/domain-management/domain-table-types';

/**
 * DomainTable Component
 *
 * Manages organization domains — create, verify, delete, and associate
 * with identity providers in a unified table interface.
 */
function DomainTableComponent(props: DomainTableProps) {
  const {
    customMessages = {},
    schema,
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    hideHeader = false,
    readOnly = false,
    createAction,
    verifyAction,
    deleteAction,
    associateToProviderAction,
    deleteFromProviderAction,
    onOpenProvider,
    onCreateProvider,
  } = props;

  const { t } = useTranslator('domain_management', customMessages);

  const domainTable = useDomainTable({
    createAction,
    verifyAction,
    deleteAction,
    associateToProviderAction,
    deleteFromProviderAction,
    customMessages,
  });

  const api = useDomainTableLogic({
    t,
    onCreateDomain: domainTable.onCreateDomain,
    onVerifyDomain: domainTable.onVerifyDomain,
    onDeleteDomain: domainTable.onDeleteDomain,
    onAssociateToProvider: domainTable.onAssociateToProvider,
    onDeleteFromProvider: domainTable.onDeleteFromProvider,
    fetchProviders: domainTable.fetchProviders,
    fetchDomains: domainTable.fetchDomains,
  });

  const logic = {
    ...domainTable,
    schema,
    styling,
    hideHeader,
    readOnly,
    onOpenProvider,
    onCreateProvider,
  };

  return <DomainTableView logic={logic} api={api} />;
}

export const DomainTable = withMyOrganizationService(
  DomainTableComponent,
  MY_ORGANIZATION_DOMAIN_SCOPES,
);
