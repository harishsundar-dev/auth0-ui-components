import type { OrganizationPrivate } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { createMockOrganization } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-details.mocks';
import type { UseOrgManagementResult } from '@/types/my-organization/org-management/org-management-types';

export const createMockOrgManagementOrganizations = (): OrganizationPrivate[] => [
  createMockOrganization(),
  {
    id: 'org_456',
    name: 'acme-corp',
    display_name: 'Acme Corp',
    branding: {
      logo_url: '',
      colors: {
        primary: '#0059d6',
        page_background: '#000000',
      },
    },
  },
];

export const createMockUseOrgManagement = (
  overrides?: Partial<UseOrgManagementResult>,
): UseOrgManagementResult => ({
  viewState: 'list',
  organizations: createMockOrgManagementOrganizations(),
  isLoadingOrganizations: false,
  selectedOrg: null,
  deleteModal: { isOpen: false, orgId: null, orgName: null },
  isMutating: false,
  alertState: { type: null, message: null },
  onNavigateToCreate: vi.fn(),
  onNavigateToEdit: vi.fn(),
  onNavigateToList: vi.fn(),
  onOpenDeleteModal: vi.fn(),
  onCloseDeleteModal: vi.fn(),
  onConfirmDelete: vi.fn().mockResolvedValue(undefined),
  onCreateOrg: vi.fn().mockResolvedValue(true),
  onUpdateOrg: vi.fn().mockResolvedValue(true),
  onDismissAlert: vi.fn(),
  ...overrides,
});
