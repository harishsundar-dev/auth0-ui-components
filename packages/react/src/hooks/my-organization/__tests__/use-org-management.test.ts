import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useOrgManagement } from '@/hooks/my-organization/use-org-management';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockOrganization,
  createQueryClientWrapper,
  mockCore,
  mockToast,
} from '@/tests/utils';

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

function createMockApiService(coreClient: ReturnType<typeof initMockCoreClient>) {
  const mockOrganization = createMockOrganization();
  const apiService = coreClient.getMyOrganizationApiClient();

  (apiService.organizations.list as ReturnType<typeof vi.fn>).mockResolvedValue([mockOrganization]);
  (apiService.organizations.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrganization);
  (apiService.organizations.update as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrganization);
  (apiService.organizations.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

  return { apiService, mockOrganization };
}

async function renderUseOrgManagement() {
  const mockCoreClient = initMockCoreClient();
  const { apiService, mockOrganization } = createMockApiService(mockCoreClient);

  vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
    coreClient: mockCoreClient,
  });

  const { wrapper, queryClient } = createQueryClientWrapper();
  const hookResult = renderHook(() => useOrgManagement({}), { wrapper });

  await waitFor(() => {
    expect(hookResult.result.current.isLoadingOrganizations).toBe(false);
  });

  return { ...hookResult, queryClient, mockCoreClient, apiService, mockOrganization };
}

describe('useOrgManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading organizations', () => {
    it('should fetch organizations on mount', async () => {
      const { apiService } = await renderUseOrgManagement();

      expect(apiService.organizations.list).toHaveBeenCalledTimes(1);
    });

    it('should return organizations after successful load', async () => {
      const { result, mockOrganization } = await renderUseOrgManagement();

      expect(result.current.organizations).toEqual([mockOrganization]);
    });
  });

  describe('view state navigation', () => {
    it('should start in list view', async () => {
      const { result } = await renderUseOrgManagement();

      expect(result.current.viewState).toBe('list');
    });

    it('should navigate to create view', async () => {
      const { result } = await renderUseOrgManagement();

      act(() => {
        result.current.onNavigateToCreate();
      });

      expect(result.current.viewState).toBe('create');
    });

    it('should navigate to edit view', async () => {
      const { result, mockOrganization } = await renderUseOrgManagement();

      act(() => {
        result.current.onNavigateToEdit(mockOrganization);
      });

      expect(result.current.viewState).toBe('edit');
      expect(result.current.selectedOrg).toEqual(mockOrganization);
    });

    it('should navigate back to list view', async () => {
      const { result, mockOrganization } = await renderUseOrgManagement();

      act(() => {
        result.current.onNavigateToEdit(mockOrganization);
      });
      act(() => {
        result.current.onNavigateToList();
      });

      expect(result.current.viewState).toBe('list');
    });

    it('should not navigate to create when readOnly', async () => {
      const mockCoreClient = initMockCoreClient();
      const { apiService } = createMockApiService(mockCoreClient);

      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
        coreClient: mockCoreClient,
      });

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useOrgManagement({ readOnly: true }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoadingOrganizations).toBe(false);
      });

      act(() => {
        result.current.onNavigateToCreate();
      });

      expect(result.current.viewState).toBe('list');
      void apiService;
    });
  });

  describe('delete modal', () => {
    it('should open delete modal', async () => {
      const { result, mockOrganization } = await renderUseOrgManagement();

      act(() => {
        result.current.onOpenDeleteModal(mockOrganization);
      });

      expect(result.current.deleteModal.isOpen).toBe(true);
      expect(result.current.deleteModal.orgId).toBe(mockOrganization.id);
      expect(result.current.deleteModal.orgName).toBe(
        mockOrganization.display_name || mockOrganization.name,
      );
    });

    it('should close delete modal', async () => {
      const { result, mockOrganization } = await renderUseOrgManagement();

      act(() => {
        result.current.onOpenDeleteModal(mockOrganization);
      });
      act(() => {
        result.current.onCloseDeleteModal();
      });

      expect(result.current.deleteModal.isOpen).toBe(false);
    });
  });

  describe('create organization', () => {
    it('should call organizations.create on submit', async () => {
      const { result, apiService, mockOrganization } = await renderUseOrgManagement();

      await act(async () => {
        await result.current.onCreateOrg(mockOrganization);
      });

      expect(apiService.organizations.create).toHaveBeenCalledTimes(1);
    });

    it('should show success toast after creation', async () => {
      const { result, mockOrganization } = await renderUseOrgManagement();

      await act(async () => {
        await result.current.onCreateOrg(mockOrganization);
      });

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String),
      });
    });

    it('should navigate to list after successful creation', async () => {
      const { result, mockOrganization } = await renderUseOrgManagement();

      act(() => {
        result.current.onNavigateToCreate();
      });

      await act(async () => {
        await result.current.onCreateOrg(mockOrganization);
      });

      expect(result.current.viewState).toBe('list');
    });

    it('should invoke onOrgCreated callback', async () => {
      const onOrgCreated = vi.fn();
      const mockCoreClient = initMockCoreClient();
      const { apiService, mockOrganization } = createMockApiService(mockCoreClient);

      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
        coreClient: mockCoreClient,
      });

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useOrgManagement({ onOrgCreated }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoadingOrganizations).toBe(false);
      });

      await act(async () => {
        await result.current.onCreateOrg(mockOrganization);
      });

      expect(onOrgCreated).toHaveBeenCalledWith(mockOrganization);
      void apiService;
    });

    it('should return false when readOnly', async () => {
      const mockCoreClient = initMockCoreClient();
      const { mockOrganization } = createMockApiService(mockCoreClient);

      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
        coreClient: mockCoreClient,
      });

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useOrgManagement({ readOnly: true }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoadingOrganizations).toBe(false);
      });

      let returnValue: boolean | undefined;
      await act(async () => {
        returnValue = await result.current.onCreateOrg(mockOrganization);
      });

      expect(returnValue).toBe(false);
    });
  });

  describe('delete organization', () => {
    it('should call organizations.delete on confirm', async () => {
      const { result, apiService, mockOrganization } = await renderUseOrgManagement();

      act(() => {
        result.current.onOpenDeleteModal(mockOrganization);
      });

      await act(async () => {
        await result.current.onConfirmDelete();
      });

      expect(apiService.organizations.delete).toHaveBeenCalledWith({
        organizationId: mockOrganization.id,
      });
    });

    it('should show success toast after deletion', async () => {
      const { result, mockOrganization } = await renderUseOrgManagement();

      act(() => {
        result.current.onOpenDeleteModal(mockOrganization);
      });

      await act(async () => {
        await result.current.onConfirmDelete();
      });

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String),
      });
    });

    it('should close delete modal after confirmation', async () => {
      const { result, mockOrganization } = await renderUseOrgManagement();

      act(() => {
        result.current.onOpenDeleteModal(mockOrganization);
      });

      await act(async () => {
        await result.current.onConfirmDelete();
      });

      expect(result.current.deleteModal.isOpen).toBe(false);
    });
  });

  describe('alert state', () => {
    it('should dismiss alert', async () => {
      const mockCoreClient = initMockCoreClient();
      createMockApiService(mockCoreClient);

      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
        coreClient: mockCoreClient,
      });

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useOrgManagement({}), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoadingOrganizations).toBe(false);
      });

      act(() => {
        result.current.onDismissAlert();
      });

      expect(result.current.alertState.type).toBeNull();
      expect(result.current.alertState.message).toBeNull();
    });
  });
});
