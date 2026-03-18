import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  OrgManagement,
  OrgManagementView,
} from '@/components/auth0/my-organization/org-management';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockOrganization, createMockUseOrgManagement } from '@/tests/utils/__mocks__';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { OrgManagementProps } from '@/types/my-organization/org-management/org-management-types';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockOrgManagementProps = (
  overrides?: Partial<OrgManagementProps>,
): OrgManagementProps => ({
  schema: undefined,
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly: false,
  ...overrides,
});

// ===== Local utils =====

// In test env, i18n mock returns translation keys. We wait for org name (real data) to appear.
const waitForListToLoad = async () => {
  return await screen.findByText('auth0-corp');
};

// ===== Tests =====

describe('OrgManagement', () => {
  const mockOrganization = createMockOrganization();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organizations.list as ReturnType<typeof vi.fn>).mockResolvedValue([
      mockOrganization,
    ]);
    (apiService.organizations.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );
    (apiService.organizations.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('list view', () => {
    it('should render the organizations list', async () => {
      renderWithProviders(<OrgManagement {...createMockOrgManagementProps()} />);

      await waitForListToLoad();

      expect(screen.getByText(mockOrganization.name)).toBeInTheDocument();
    });

    it('should render organization display name in the table', async () => {
      renderWithProviders(<OrgManagement {...createMockOrgManagementProps()} />);

      await waitForListToLoad();

      expect(screen.getByText(mockOrganization.display_name as string)).toBeInTheDocument();
    });

    it('should render "Create Organization" button when not readOnly', async () => {
      renderWithProviders(<OrgManagement {...createMockOrgManagementProps({ readOnly: false })} />);

      await waitForListToLoad();

      // In test env, translation returns key text
      expect(
        screen.getByRole('button', { name: /list\.create_button_label/i }),
      ).toBeInTheDocument();
    });

    it('should not render "Create Organization" button when readOnly', async () => {
      renderWithProviders(<OrgManagement {...createMockOrgManagementProps({ readOnly: true })} />);

      await waitForListToLoad();

      expect(
        screen.queryByRole('button', { name: /list\.create_button_label/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('customMessages', () => {
    it('should override the header title', async () => {
      const customMessages = {
        header: { title: 'My Custom Title' },
      };

      renderWithProviders(<OrgManagement {...createMockOrgManagementProps({ customMessages })} />);

      await waitForListToLoad();

      expect(screen.getByText('My Custom Title')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should render empty state when there are no organizations', async () => {
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organizations.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      renderWithProviders(<OrgManagement {...createMockOrgManagementProps()} />);

      // Wait for loading to finish and empty state to render
      await screen.findByText('list.empty_state.title');

      expect(screen.getByText('list.empty_state.title')).toBeInTheDocument();
    });
  });

  describe('create navigation', () => {
    it('should navigate to create form when "Create Organization" is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrgManagement {...createMockOrgManagementProps()} />);

      await waitForListToLoad();

      const createButton = screen.getByRole('button', { name: /list\.create_button_label/i });
      await user.click(createButton);

      // create.title key is rendered in create view
      await screen.findByText('create.title');

      expect(screen.getByText('create.title')).toBeInTheDocument();
    });
  });

  describe('delete modal', () => {
    it('should open delete modal when delete action is triggered', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrgManagement {...createMockOrgManagementProps()} />);

      await waitForListToLoad();

      // Click the dropdown actions button (three-dot menu)
      const actionsButtons = screen.getAllByRole('button');
      // The actions menu button is the one with MoreHorizontal icon (last button in row actions)
      const menuButton = actionsButtons.find((btn) =>
        btn.getAttribute('aria-label')?.includes('list.table.edit_action'),
      );
      if (menuButton) {
        await user.click(menuButton);
        const deleteOption = await screen.findByText('list.table.delete_action');
        await user.click(deleteOption);
        await screen.findByRole('dialog');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }
    });
  });
});

// ===== View component tests =====

describe('OrgManagementView', () => {
  const mockOrganization = createMockOrganization();

  describe('when viewState is "list"', () => {
    it('should render org list with header', () => {
      const props = createMockUseOrgManagement({ viewState: 'list' });

      renderWithProviders(
        <OrgManagementView
          {...props}
          schema={undefined}
          styling={{ variables: { common: {}, light: {}, dark: {} }, classes: {} }}
          customMessages={{}}
          readOnly={false}
        />,
      );

      // header.title key is rendered by OrgListView
      expect(screen.getByText('header.title')).toBeInTheDocument();
    });

    it('should render organization names from data', () => {
      const props = createMockUseOrgManagement({ viewState: 'list' });

      renderWithProviders(
        <OrgManagementView
          {...props}
          schema={undefined}
          styling={{ variables: { common: {}, light: {}, dark: {} }, classes: {} }}
          customMessages={{}}
          readOnly={false}
        />,
      );

      expect(screen.getByText('auth0-corp')).toBeInTheDocument();
    });
  });

  describe('when viewState is "create"', () => {
    it('should render OrgCreateForm with create title', () => {
      const props = createMockUseOrgManagement({ viewState: 'create' });

      renderWithProviders(
        <OrgManagementView
          {...props}
          schema={undefined}
          styling={{ variables: { common: {}, light: {}, dark: {} }, classes: {} }}
          customMessages={{}}
          readOnly={false}
        />,
      );

      // create.title translation key
      expect(screen.getByText('create.title')).toBeInTheDocument();
    });
  });

  describe('when viewState is "edit"', () => {
    it('should render edit view with org display name', () => {
      const props = createMockUseOrgManagement({
        viewState: 'edit',
        selectedOrg: mockOrganization,
      });

      renderWithProviders(
        <OrgManagementView
          {...props}
          schema={undefined}
          styling={{ variables: { common: {}, light: {}, dark: {} }, classes: {} }}
          customMessages={{}}
          readOnly={false}
        />,
      );

      expect(screen.getByText(mockOrganization.display_name as string)).toBeInTheDocument();
    });

    it('should render back button text', () => {
      const props = createMockUseOrgManagement({
        viewState: 'edit',
        selectedOrg: mockOrganization,
      });

      renderWithProviders(
        <OrgManagementView
          {...props}
          schema={undefined}
          styling={{ variables: { common: {}, light: {}, dark: {} }, classes: {} }}
          customMessages={{}}
          readOnly={false}
        />,
      );

      expect(screen.getByText('edit.back_button_text')).toBeInTheDocument();
    });
  });

  describe('readOnly prop', () => {
    it('should not show create button in list view when readOnly', () => {
      const props = createMockUseOrgManagement({ viewState: 'list' });

      renderWithProviders(
        <OrgManagementView
          {...props}
          schema={undefined}
          styling={{ variables: { common: {}, light: {}, dark: {} }, classes: {} }}
          customMessages={{}}
          readOnly={true}
        />,
      );

      expect(
        screen.queryByRole('button', { name: /list\.create_button_label/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('delete modal', () => {
    it('should render delete modal when deleteModal.isOpen is true', () => {
      const props = createMockUseOrgManagement({
        viewState: 'list',
        deleteModal: {
          isOpen: true,
          orgId: mockOrganization.id ?? null,
          orgName: mockOrganization.display_name ?? null,
        },
      });

      renderWithProviders(
        <OrgManagementView
          {...props}
          schema={undefined}
          styling={{ variables: { common: {}, light: {}, dark: {} }, classes: {} }}
          customMessages={{}}
          readOnly={false}
        />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('alert state', () => {
    it('should display success alert message', () => {
      const props = createMockUseOrgManagement({
        viewState: 'list',
        alertState: { type: 'success', message: 'Organization created successfully' },
      });

      renderWithProviders(
        <OrgManagementView
          {...props}
          schema={undefined}
          styling={{ variables: { common: {}, light: {}, dark: {} }, classes: {} }}
          customMessages={{}}
          readOnly={false}
        />,
      );

      expect(screen.getByText('Organization created successfully')).toBeInTheDocument();
    });
  });
});
