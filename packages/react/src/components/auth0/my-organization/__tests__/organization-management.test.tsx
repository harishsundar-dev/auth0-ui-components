import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { OrganizationManagement } from '@/components/auth0/my-organization/organization-management';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type {
  OrganizationManagementClient,
  OrganizationManagementProps,
  OrganizationSummary,
} from '@/types/my-organization/organization-management/organization-management-types';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockOrg = (overrides?: Partial<OrganizationSummary>): OrganizationSummary => ({
  id: 'org_001',
  name: 'acme-corp',
  display_name: 'Acme Corp',
  ...overrides,
});

const createMockClient = (
  orgs: OrganizationSummary[] = [],
  overrides?: Partial<OrganizationManagementClient>,
): OrganizationManagementClient => {
  const org1 = createMockOrg();
  return {
    organizations: {
      list: vi.fn().mockResolvedValue(orgs),
      create: vi
        .fn()
        .mockResolvedValue(
          createMockOrg({ id: 'org_new', name: 'bulba_leaf', display_name: 'Bulba Leaf' }),
        ),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    organizationDetails: {
      get: vi.fn().mockResolvedValue({
        id: org1.id,
        name: org1.name,
        display_name: org1.display_name,
        branding: {
          logo_url: 'https://example.com/logo.png',
          colors: { primary: '#eb5424', page_background: '#000000' },
        },
      }),
      update: vi.fn().mockResolvedValue({
        id: org1.id,
        name: org1.name,
        display_name: org1.display_name,
        branding: {
          logo_url: 'https://example.com/newlogo.png',
          colors: { primary: '#eb5424', page_background: '#000000' },
        },
      }),
    },
    ...overrides,
  };
};

const createProps = (
  overrides?: Partial<OrganizationManagementProps>,
): OrganizationManagementProps => ({
  variant: 'v2',
  client: createMockClient(),
  customMessages: {},
  ...overrides,
});

// ===== Tests =====

describe('OrganizationManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockCoreClient = initMockCoreClient();
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('table view', () => {
    describe('when there are no organizations', () => {
      it('should render the empty state message', async () => {
        const client = createMockClient([]);
        renderWithProviders(<OrganizationManagement {...createProps({ client })} />);

        // Mock i18n returns the key; empty state text key is 'table.empty_state'
        await waitFor(() => {
          expect(screen.getByText(/table\.empty_state/i)).toBeInTheDocument();
        });
      });

      it('should show Create Organization button in empty state for v2', async () => {
        const client = createMockClient([]);
        renderWithProviders(<OrganizationManagement {...createProps({ client, variant: 'v2' })} />);

        // Mock i18n returns the key; create button text key is 'table.create_button'
        await waitFor(() => {
          expect(screen.getAllByText(/table\.create_button/i).length).toBeGreaterThan(0);
        });
      });

      it('should not show Create Organization button for v1', async () => {
        const client = createMockClient([]);
        renderWithProviders(<OrganizationManagement {...createProps({ client, variant: 'v1' })} />);

        await waitFor(() => {
          expect(screen.getByText(/table\.empty_state/i)).toBeInTheDocument();
        });

        expect(screen.queryByText(/table\.create_button/i)).not.toBeInTheDocument();
      });
    });

    describe('when there are organizations', () => {
      it('should render the list of organizations by display name', async () => {
        const orgs = [
          createMockOrg({ id: 'org_1', name: 'staff0', display_name: 'Staff0' }),
          createMockOrg({ id: 'org_2', name: 'acme-corp', display_name: 'Acme Corp' }),
          createMockOrg({ id: 'org_3', name: 'bulba_leaf', display_name: 'Bulba Leaf' }),
        ];
        const client = createMockClient(orgs);
        renderWithProviders(<OrganizationManagement {...createProps({ client })} />);

        await waitFor(() => {
          expect(screen.getByText('Staff0')).toBeInTheDocument();
          expect(screen.getByText('Acme Corp')).toBeInTheDocument();
          expect(screen.getByText('Bulba Leaf')).toBeInTheDocument();
        });
      });

      it('should render the org machine name (identifier) in each row', async () => {
        const orgs = [createMockOrg()];
        const client = createMockClient(orgs);
        renderWithProviders(<OrganizationManagement {...createProps({ client })} />);

        await waitFor(() => {
          expect(screen.getByText('acme-corp')).toBeInTheDocument();
        });
      });
    });

    describe('search', () => {
      it('should filter organizations by display name', async () => {
        const user = userEvent.setup();
        const orgs = [
          createMockOrg({ id: 'org_1', name: 'staff0', display_name: 'Staff0' }),
          createMockOrg({ id: 'org_2', name: 'acme-corp', display_name: 'Acme Corp' }),
        ];
        const client = createMockClient(orgs);
        renderWithProviders(<OrganizationManagement {...createProps({ client })} />);

        await waitFor(() => {
          expect(screen.getByText('Staff0')).toBeInTheDocument();
        });

        // Search input has aria-label that uses the i18n key
        const searchInput = screen.getByRole('textbox');
        await user.type(searchInput, 'Acme');

        await waitFor(() => {
          expect(screen.queryByText('Staff0')).not.toBeInTheDocument();
          expect(screen.getByText('Acme Corp')).toBeInTheDocument();
        });
      });
    });
  });

  describe('v1 variant', () => {
    it('should hide create button in v1 when orgs exist', async () => {
      const orgs = [createMockOrg()];
      const client = createMockClient(orgs);
      renderWithProviders(<OrganizationManagement {...createProps({ client, variant: 'v1' })} />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      expect(screen.queryByText(/table\.create_button/i)).not.toBeInTheDocument();
    });

    it('should hide delete action in row context menu for v1', async () => {
      const user = userEvent.setup();
      const orgs = [createMockOrg()];
      const client = createMockClient(orgs);
      renderWithProviders(<OrganizationManagement {...createProps({ client, variant: 'v1' })} />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      // Open the dropdown for the row; aria-label uses i18n key 'row_actions.edit' + org name
      const menuButton = screen.getByRole('button', { name: /row_actions\.edit Acme Corp/i });
      await user.click(menuButton);

      await waitFor(() => {
        // Edit item exists (key: row_actions.edit)
        expect(screen.getByText(/row_actions\.edit/i)).toBeInTheDocument();
        // Delete item should NOT exist (key: row_actions.delete)
        expect(screen.queryByText(/row_actions\.delete/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('create flow', () => {
    it('should navigate to the create form when Create Organization is clicked', async () => {
      const user = userEvent.setup();
      const client = createMockClient([]);
      renderWithProviders(<OrganizationManagement {...createProps({ client, variant: 'v2' })} />);

      await waitFor(() => {
        expect(screen.getByText(/table\.empty_state/i)).toBeInTheDocument();
      });

      // Click the Create Organization button (toolbar or empty state CTA)
      const createButtons = screen.getAllByText(/table\.create_button/i);
      await user.click(createButtons[0]!);

      // Should navigate to create form
      await waitFor(() => {
        expect(screen.getByText(/create\.title/i)).toBeInTheDocument();
      });
    });

    it('should navigate back to table when Cancel is clicked in create view', async () => {
      const user = userEvent.setup();
      const client = createMockClient([]);
      renderWithProviders(<OrganizationManagement {...createProps({ client, variant: 'v2' })} />);

      await waitFor(() => {
        expect(screen.getByText(/table\.empty_state/i)).toBeInTheDocument();
      });

      const createButtons = screen.getAllByText(/table\.create_button/i);
      await user.click(createButtons[0]!);

      await waitFor(() => {
        expect(screen.getByText(/create\.title/i)).toBeInTheDocument();
      });

      // Click the back button (key: create.back_button)
      const backButton = screen.getByText(/create\.back_button/i);
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText(/table\.empty_state/i)).toBeInTheDocument();
      });
    });
  });

  describe('edit flow', () => {
    it('should navigate to details view when Edit is selected from context menu', async () => {
      const user = userEvent.setup();
      const orgs = [createMockOrg()];
      const client = createMockClient(orgs);
      renderWithProviders(<OrganizationManagement {...createProps({ client })} />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      // Open context menu (aria-label uses i18n key)
      const menuButton = screen.getByRole('button', { name: /row_actions\.edit Acme Corp/i });
      await user.click(menuButton);

      // Click Edit from the dropdown (key: row_actions.edit)
      const editItem = await screen.findByRole('menuitem', { name: /row_actions\.edit/i });
      await user.click(editItem);

      // Should call organizationDetails.get for the selected org
      await waitFor(() => {
        expect(client.organizationDetails.get).toHaveBeenCalledWith('org_001', expect.any(Object));
      });
    });

    it('should navigate back to table from details view', async () => {
      const user = userEvent.setup();
      const orgs = [createMockOrg()];
      const client = createMockClient(orgs);
      renderWithProviders(<OrganizationManagement {...createProps({ client })} />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      // Open context menu and click Edit
      const menuButton = screen.getByRole('button', { name: /row_actions\.edit Acme Corp/i });
      await user.click(menuButton);
      const editItem = await screen.findByRole('menuitem', { name: /row_actions\.edit/i });
      await user.click(editItem);

      // Wait for details view to load (back button key: header.back_button_text)
      await waitFor(() => {
        expect(screen.getByText(/header\.back_button_text/i)).toBeInTheDocument();
      });

      const backButton = screen.getByText(/header\.back_button_text/i);
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });
    });
  });

  describe('delete flow from list', () => {
    it('should open delete dialog when Delete is clicked from context menu (v2)', async () => {
      const user = userEvent.setup();
      const orgs = [createMockOrg()];
      const client = createMockClient(orgs);
      renderWithProviders(<OrganizationManagement {...createProps({ client, variant: 'v2' })} />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      // Open context menu
      const menuButton = screen.getByRole('button', { name: /row_actions\.edit Acme Corp/i });
      await user.click(menuButton);

      // Click Delete (key: row_actions.delete)
      const deleteItem = await screen.findByRole('menuitem', { name: /row_actions\.delete/i });
      await user.click(deleteItem);

      // Dialog should appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should require org name confirmation before enabling delete button', async () => {
      const user = userEvent.setup();
      const orgs = [createMockOrg()];
      const client = createMockClient(orgs);
      renderWithProviders(<OrganizationManagement {...createProps({ client, variant: 'v2' })} />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      // Open context menu and click Delete
      const menuButton = screen.getByRole('button', { name: /row_actions\.edit Acme Corp/i });
      await user.click(menuButton);
      const deleteItem = await screen.findByRole('menuitem', { name: /row_actions\.delete/i });
      await user.click(deleteItem);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // The delete button should be disabled when confirmation is empty
      // Key: delete_button_label
      const deleteButton = screen.getByRole('button', { name: /delete_button_label/i });
      expect(deleteButton).toBeDisabled();

      // Type wrong org name — still disabled
      const confirmInput = screen.getByRole('textbox');
      await user.type(confirmInput, 'wrong-name');
      expect(deleteButton).toBeDisabled();

      // Type correct org name (machine name) — becomes enabled
      await user.clear(confirmInput);
      await user.type(confirmInput, 'acme-corp');
      expect(deleteButton).not.toBeDisabled();
    });

    it('should delete org and show success alert after confirmation', async () => {
      const user = userEvent.setup();
      const orgs = [createMockOrg()];
      const client = createMockClient(orgs);
      renderWithProviders(<OrganizationManagement {...createProps({ client, variant: 'v2' })} />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      // Open context menu and click Delete
      const menuButton = screen.getByRole('button', { name: /row_actions\.edit Acme Corp/i });
      await user.click(menuButton);
      const deleteItem = await screen.findByRole('menuitem', { name: /row_actions\.delete/i });
      await user.click(deleteItem);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Type correct org machine name
      const confirmInput = screen.getByRole('textbox');
      await user.type(confirmInput, 'acme-corp');

      // Confirm deletion
      const deleteButton = screen.getByRole('button', { name: /delete_button_label/i });
      await user.click(deleteButton);

      // Should call the delete API
      await waitFor(() => {
        expect(client.organizations.delete).toHaveBeenCalledWith('org_001');
      });

      // Should show success alert (key: alerts.deleted with org name interpolated)
      await waitFor(() => {
        expect(screen.getByText(/alerts\.deleted/i)).toBeInTheDocument();
      });
    });

    it('should close delete dialog when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const orgs = [createMockOrg()];
      const client = createMockClient(orgs);
      renderWithProviders(<OrganizationManagement {...createProps({ client, variant: 'v2' })} />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      });

      const menuButton = screen.getByRole('button', { name: /row_actions\.edit Acme Corp/i });
      await user.click(menuButton);
      const deleteItem = await screen.findByRole('menuitem', { name: /row_actions\.delete/i });
      await user.click(deleteItem);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Cancel (key: cancel_button_label)
      const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('error state', () => {
    it('should show error alert when list API fails', async () => {
      const client = createMockClient([], {
        organizations: {
          list: vi.fn().mockRejectedValue(new Error('Network error')),
          create: vi.fn(),
          delete: vi.fn(),
        },
      });

      renderWithProviders(<OrganizationManagement {...createProps({ client })} />);

      // Error alert key: alerts.error
      await waitFor(() => {
        expect(screen.getByText(/alerts\.error/i)).toBeInTheDocument();
      });
    });
  });
});
