/**
 * Root state hook for the OrganizationManagement block.
 * @module use-organization-management
 */

import * as React from 'react';

import type {
  OrgManagementActiveView,
  OrgManagementAlertState,
  OrganizationManagementClient,
  OrganizationManagementProps,
  OrganizationSummary,
  UseOrganizationManagementResult,
} from '@/types/my-organization/organization-management/organization-management-types';

const ALERT_DISMISS_DELAY_MS = 5000;

/**
 * Root hook for the OrganizationManagement block.
 *
 * Manages top-level view state and navigation between table, create, and detail views.
 * All business logic for the multi-view dashboard lives here; components are purely
 * presentational and receive data/callbacks via props.
 *
 * @param client - Organization API client.
 * @param variant - Block variant ('v1' | 'v2').
 * @returns Hook state and navigation callbacks.
 */
export function useOrganizationManagement(
  client: OrganizationManagementClient,
  variant: NonNullable<OrganizationManagementProps['variant']>,
): UseOrganizationManagementResult {
  const isV2 = variant === 'v2';

  const [activeView, setActiveView] = React.useState<OrgManagementActiveView>('table');
  const [selectedOrg, setSelectedOrg] = React.useState<OrganizationSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<OrganizationSummary | null>(null);
  const [alertState, setAlertState] = React.useState<OrgManagementAlertState | null>(null);
  const [organizations, setOrganizations] = React.useState<OrganizationSummary[]>([]);
  const [isListLoading, setIsListLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Auto-dismiss alert after ALERT_DISMISS_DELAY_MS
  React.useEffect(() => {
    if (!alertState) return;

    const timeoutId = setTimeout(() => {
      setAlertState(null);
    }, ALERT_DISMISS_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [alertState]);

  // Load the organization list on mount and whenever we return to the table
  React.useEffect(() => {
    const controller = new AbortController();

    const fetchOrgs = async () => {
      setIsListLoading(true);
      try {
        const orgs = await client.organizations.list({ abortSignal: controller.signal });
        setOrganizations(orgs);
      } catch (error) {
        // Ignore abort errors; set error alert for real failures
        if (error instanceof Error && error.name !== 'AbortError') {
          setAlertState({ type: 'error' });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsListLoading(false);
        }
      }
    };

    if (activeView === 'table') {
      void fetchOrgs();
    }

    return () => controller.abort();
  }, [client, activeView]);

  const filteredOrganizations = React.useMemo(() => {
    if (!searchQuery.trim()) return organizations;
    const lower = searchQuery.toLowerCase();
    return organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(lower) ||
        (org.display_name ?? '').toLowerCase().includes(lower),
    );
  }, [organizations, searchQuery]);

  const onSearchChange = React.useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const onNavigateToCreate = React.useCallback(() => {
    if (!isV2) return;
    setActiveView('create');
  }, [isV2]);

  const onNavigateToDetails = React.useCallback((org: OrganizationSummary) => {
    setSelectedOrg(org);
    setActiveView('details');
  }, []);

  const onNavigateToTable = React.useCallback(() => {
    setSelectedOrg(null);
    setActiveView('table');
  }, []);

  const onRequestDelete = React.useCallback(
    (org: OrganizationSummary) => {
      if (!isV2) return;
      setDeleteTarget(org);
    },
    [isV2],
  );

  const onCancelDelete = React.useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const onConfirmDelete = React.useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await client.organizations.delete(deleteTarget.id);
      const orgName = deleteTarget.display_name ?? deleteTarget.name;
      setOrganizations((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSelectedOrg(null);
      setActiveView('table');
      setAlertState({ type: 'deleted', orgName });
    } catch {
      setAlertState({ type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }, [client.organizations, deleteTarget]);

  const onOrgCreated = React.useCallback((org: OrganizationSummary) => {
    setOrganizations((prev) => [...prev, org]);
    setActiveView('table');
    setAlertState({ type: 'created', orgName: org.display_name ?? org.name });
  }, []);

  const onOrgSaved = React.useCallback((orgName: string) => {
    setAlertState({ type: 'saved', orgName });
  }, []);

  return {
    activeView,
    selectedOrg,
    deleteTarget,
    alertState,
    organizations,
    isListLoading,
    isDeleting,
    searchQuery,
    filteredOrganizations,
    onSearchChange,
    onNavigateToCreate,
    onNavigateToDetails,
    onNavigateToTable,
    onRequestDelete,
    onCancelDelete,
    onConfirmDelete,
    onOrgCreated,
    onOrgSaved,
  };
}
