import { createMockOrganization } from './organization-details.mocks';

import type { OrganizationManagementViewProps } from '@/types/my-organization/organization-management/organization-management-types';

export function createMockOrganizationManagementView(
  overrides: Partial<OrganizationManagementViewProps> = {},
): OrganizationManagementViewProps {
  return {
    organization: { ...createMockOrganization() },
    isFetchLoading: false,
    schema: undefined,
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    customMessages: {},
    readOnly: false,
    hideHeader: false,
    defaultTab: 'settings',
    saveAction: undefined,
    cancelAction: undefined,
    deleteAction: undefined,
    formActions: {
      isLoading: false,
      nextAction: {
        disabled: false,
        onClick: () => Promise.resolve(true),
      },
    },
    management: {
      isDeleteModalOpen: false,
      isDeleting: false,
      openDeleteModal: () => undefined,
      closeDeleteModal: () => undefined,
      handleDeleteConfirm: () => Promise.resolve(),
    },
    ...overrides,
  };
}
