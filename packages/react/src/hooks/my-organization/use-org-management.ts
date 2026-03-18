/**
 * OrgManagement hook.
 * @module use-org-management
 */

import {
  MY_ORGANIZATION_MANAGEMENT_SCOPES,
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  type OrganizationPrivate,
} from '@auth0/universal-components-core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  OrgDeleteModalState,
  OrgManagementAlertState,
  OrgManagementViewState,
  UseOrgManagementOptions,
  UseOrgManagementResult,
} from '@/types/my-organization/org-management/org-management-types';

const orgManagementQueryKeys = {
  all: ['org-management'] as const,
  list: () => [...orgManagementQueryKeys.all, 'list'] as const,
};

const EMPTY_ORG = OrganizationDetailsFactory.create();

const INITIAL_DELETE_MODAL: OrgDeleteModalState = {
  isOpen: false,
  orgId: null,
  orgName: null,
};

const INITIAL_ALERT: OrgManagementAlertState = {
  type: null,
  message: null,
};

/**
 * Hook for managing multiple organizations including CRUD operations and view state.
 *
 * @param options - Hook options
 * @returns Hook state and action handlers
 */
export function useOrgManagement({
  customMessages = {},
  readOnly = false,
  onOrgCreated,
  onOrgUpdated,
  onOrgDeleted,
}: UseOrgManagementOptions): UseOrgManagementResult {
  const { t } = useTranslator('organization_management.org_management', customMessages);
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const [viewState, setViewState] = useState<OrgManagementViewState>('list');
  const [selectedOrg, setSelectedOrg] = useState<OrganizationPrivate | null>(null);
  const [deleteModal, setDeleteModal] = useState<OrgDeleteModalState>(INITIAL_DELETE_MODAL);
  const [alertState, setAlertState] = useState<OrgManagementAlertState>(INITIAL_ALERT);

  const isInitializing = !coreClient;

  // ===== Queries =====

  const organizationsQuery = useQuery({
    queryKey: orgManagementQueryKeys.list(),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_MANAGEMENT_SCOPES)
        .organizations.list();
      return response;
    },
    enabled: !!coreClient,
  });

  // ===== Mutations =====

  const createMutation = useMutation({
    mutationFn: async (data: OrganizationPrivate) => {
      const { id: _id, ...body } = data;
      return coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_MANAGEMENT_SCOPES)
        .organizations.create(body);
    },
    onSuccess: (newOrg, variables) => {
      queryClient.invalidateQueries({ queryKey: orgManagementQueryKeys.list() });
      const orgName = variables.display_name || variables.name || '';
      const message = t('create.created_message', { organizationName: orgName });
      showToast({ type: 'success', message });
      setAlertState({ type: 'success', message });
      setViewState('list');
      onOrgCreated?.(newOrg);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? t('create.error_message', { message: error.message })
          : t('create.error_message', { message: 'Unknown error' });
      showToast({ type: 'error', message });
      setAlertState({ type: 'error', message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: OrganizationPrivate) => {
      const organizationId = data.id;
      if (!organizationId) throw new Error('Organization ID is required for update');
      const { id: _id, ...body } = data;
      return coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_MANAGEMENT_SCOPES)
        .organizations.update({ organizationId, body });
    },
    onSuccess: (updatedOrg, variables) => {
      queryClient.invalidateQueries({ queryKey: orgManagementQueryKeys.list() });
      setSelectedOrg(updatedOrg);
      const orgName = variables.display_name || variables.name || '';
      const message = t('edit.updated_message', { organizationName: orgName });
      showToast({ type: 'success', message });
      onOrgUpdated?.(updatedOrg);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? t('create.error_message', { message: error.message })
          : t('create.error_message', { message: 'Unknown error' });
      showToast({ type: 'error', message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      return coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_MANAGEMENT_SCOPES)
        .organizations.delete({ organizationId });
    },
    onSuccess: (_, organizationId) => {
      queryClient.invalidateQueries({ queryKey: orgManagementQueryKeys.list() });
      const orgName = deleteModal.orgName || '';
      const message = t('delete.deleted_message', { organizationName: orgName });
      showToast({ type: 'success', message });
      setAlertState({ type: 'success', message });
      setDeleteModal(INITIAL_DELETE_MODAL);
      setViewState('list');
      setSelectedOrg(null);
      onOrgDeleted?.(organizationId);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? t('create.error_message', { message: error.message })
          : t('create.error_message', { message: 'Unknown error' });
      showToast({ type: 'error', message });
      setAlertState({ type: 'error', message });
      setDeleteModal(INITIAL_DELETE_MODAL);
    },
  });

  // ===== Derived state =====

  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // ===== Navigation =====

  const onNavigateToCreate = useCallback(() => {
    if (readOnly || isInitializing) return;
    setSelectedOrg(null);
    setViewState('create');
  }, [readOnly, isInitializing]);

  const onNavigateToEdit = useCallback((org: OrganizationPrivate) => {
    setSelectedOrg(org);
    setViewState('edit');
  }, []);

  const onNavigateToList = useCallback(() => {
    setSelectedOrg(null);
    setViewState('list');
  }, []);

  // ===== Modal actions =====

  const onOpenDeleteModal = useCallback((org: OrganizationPrivate) => {
    if (!org.id) return;
    setDeleteModal({
      isOpen: true,
      orgId: org.id,
      orgName: org.display_name || org.name || '',
    });
  }, []);

  const onCloseDeleteModal = useCallback(() => {
    setDeleteModal(INITIAL_DELETE_MODAL);
  }, []);

  const onConfirmDelete = useCallback(async (): Promise<void> => {
    if (!deleteModal.orgId) return;
    await deleteMutation.mutateAsync(deleteModal.orgId);
  }, [deleteModal.orgId, deleteMutation]);

  // ===== CRUD actions =====

  const onCreateOrg = useCallback(
    async (data: OrganizationPrivate): Promise<boolean> => {
      if (readOnly) return false;
      try {
        await createMutation.mutateAsync(data);
        return true;
      } catch {
        return false;
      }
    },
    [readOnly, createMutation],
  );

  const onUpdateOrg = useCallback(
    async (data: OrganizationPrivate): Promise<boolean> => {
      if (readOnly) return false;
      try {
        await updateMutation.mutateAsync(data);
        return true;
      } catch {
        return false;
      }
    },
    [readOnly, updateMutation],
  );

  const onDismissAlert = useCallback(() => {
    setAlertState(INITIAL_ALERT);
  }, []);

  // ===== Return =====

  return useMemo(
    () => ({
      viewState,
      organizations: organizationsQuery.data ?? [],
      isLoadingOrganizations: organizationsQuery.isFetching || isInitializing,
      selectedOrg: selectedOrg ?? EMPTY_ORG,
      deleteModal,
      isMutating,
      alertState,
      onNavigateToCreate,
      onNavigateToEdit,
      onNavigateToList,
      onOpenDeleteModal,
      onCloseDeleteModal,
      onConfirmDelete,
      onCreateOrg,
      onUpdateOrg,
      onDismissAlert,
    }),
    [
      viewState,
      organizationsQuery.data,
      organizationsQuery.isFetching,
      isInitializing,
      selectedOrg,
      deleteModal,
      isMutating,
      alertState,
      onNavigateToCreate,
      onNavigateToEdit,
      onNavigateToList,
      onOpenDeleteModal,
      onCloseDeleteModal,
      onConfirmDelete,
      onCreateOrg,
      onUpdateOrg,
      onDismissAlert,
    ],
  );
}
