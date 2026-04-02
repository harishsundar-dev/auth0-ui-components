import type { ComponentAction, OrganizationPrivate } from '@auth0/universal-components-core';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  OrganizationManagement,
  OrganizationManagementView,
} from '@/components/auth0/my-organization/organization-management';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockOrganization } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-details.mocks';
import { createMockOrganizationManagementView } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-management.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { OrganizationManagementProps } from '@/types/my-organization/organization-management/organization-management-types';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockOrganizationManagementProps = (
  overrides?: Partial<OrganizationManagementProps>,
): OrganizationManagementProps => ({
  schema: undefined,
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly: false,
  hideHeader: false,
  saveAction: undefined,
  cancelAction: undefined,
  deleteAction: undefined,
  defaultTab: 'settings',
  ...overrides,
});

const createMockDeleteAction = (): Omit<ComponentAction<OrganizationPrivate>, 'onBefore'> => ({
  disabled: false,
  onAfter: vi.fn(),
});

// ===== Local utils =====

const waitForComponentToLoad = async () => {
  return await screen.findByDisplayValue('Auth0 Corporation');
};

// ===== Tests =====

describe('OrganizationManagement', () => {
  const mockOrganization = createMockOrganization();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );
    (apiService.organizationDetails.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );
    (apiService.organization.identityProviders.list as ReturnType<typeof vi.fn>).mockResolvedValue(
      [],
    );
    (apiService.organization.domains.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('defaultTab', () => {
    describe('when defaultTab is settings', () => {
      it('should render the settings tab content', async () => {
        renderWithProviders(
          <OrganizationManagement
            {...createMockOrganizationManagementProps({ defaultTab: 'settings' })}
          />,
        );

        await waitForComponentToLoad();

        expect(screen.getByTestId('organization-details-card')).toBeInTheDocument();
      });
    });
  });

  describe('tab navigation', () => {
    it('should switch to SSO tab when clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationManagement {...createMockOrganizationManagementProps()} />);

      await waitForComponentToLoad();

      const ssoTab = screen.getByRole('tab', { name: /tabs\.sso/i });
      await user.click(ssoTab);

      await waitFor(() => {
        expect(ssoTab).toHaveAttribute('data-state', 'active');
      });
    });

    it('should switch to Domains tab when clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationManagement {...createMockOrganizationManagementProps()} />);

      await waitForComponentToLoad();

      const domainsTab = screen.getByRole('tab', { name: /tabs\.domains/i });
      await user.click(domainsTab);

      await waitFor(() => {
        expect(domainsTab).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('deleteAction', () => {
    describe('when deleteAction is provided', () => {
      it('should render the danger zone delete button', async () => {
        const mockDeleteAction = createMockDeleteAction();

        renderWithProviders(
          <OrganizationManagement
            {...createMockOrganizationManagementProps({ deleteAction: mockDeleteAction })}
          />,
        );

        await waitForComponentToLoad();

        expect(screen.getByTestId('delete-organization-button')).toBeInTheDocument();
      });

      it('should open the delete modal when delete button is clicked', async () => {
        const user = userEvent.setup();
        const mockDeleteAction = createMockDeleteAction();

        renderWithProviders(
          <OrganizationManagement
            {...createMockOrganizationManagementProps({ deleteAction: mockDeleteAction })}
          />,
        );

        await waitForComponentToLoad();

        const deleteButton = screen.getByTestId('delete-organization-button');
        await user.click(deleteButton);

        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
      });

      it('should call deleteAction.onAfter when deletion is confirmed', async () => {
        const user = userEvent.setup();
        const mockDeleteAction = createMockDeleteAction();

        renderWithProviders(
          <OrganizationManagement
            {...createMockOrganizationManagementProps({ deleteAction: mockDeleteAction })}
          />,
        );

        await waitForComponentToLoad();

        const deleteButton = screen.getByTestId('delete-organization-button');
        await user.click(deleteButton);

        const dialog = await screen.findByRole('dialog');
        const confirmInput = within(dialog).getByRole('textbox');
        await user.type(confirmInput, mockOrganization.name);

        await waitFor(() => {
          const confirmDeleteButton = within(dialog).getByRole('button', {
            name: /delete_button_label/i,
          });
          expect(confirmDeleteButton).not.toBeDisabled();
        });

        const confirmDeleteButton = within(dialog).getByRole('button', {
          name: /delete_button_label/i,
        });
        await user.click(confirmDeleteButton);

        await waitFor(() => {
          expect(mockDeleteAction.onAfter).toHaveBeenCalledWith(mockOrganization);
        });
      });
    });

    describe('when deleteAction is not provided', () => {
      it('should not render the danger zone', async () => {
        renderWithProviders(
          <OrganizationManagement
            {...createMockOrganizationManagementProps({ deleteAction: undefined })}
          />,
        );

        await waitForComponentToLoad();

        expect(screen.queryByTestId('delete-organization-button')).not.toBeInTheDocument();
      });
    });
  });

  describe('readOnly', () => {
    describe('when is true', () => {
      it('should disable inputs and buttons', async () => {
        renderWithProviders(
          <OrganizationManagement {...createMockOrganizationManagementProps({ readOnly: true })} />,
        );

        const displayNameInput = await waitForComponentToLoad();

        const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
        expect(saveButton).toBeDisabled();
        expect(displayNameInput).toHaveAttribute('readonly');
      });
    });
  });

  describe('hideHeader', () => {
    describe('when is false', () => {
      it('should render the header', async () => {
        renderWithProviders(
          <OrganizationManagement
            {...createMockOrganizationManagementProps({ hideHeader: false })}
          />,
        );

        await waitForComponentToLoad();

        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
    });

    describe('when is true', () => {
      it('should not render the header', async () => {
        renderWithProviders(
          <OrganizationManagement
            {...createMockOrganizationManagementProps({ hideHeader: true })}
          />,
        );

        await waitForComponentToLoad();

        expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      });
    });
  });
});

describe('OrganizationManagementView', () => {
  const viewProps = createMockOrganizationManagementView();

  it('renders the settings tab with organization details', () => {
    renderWithProviders(<OrganizationManagementView {...viewProps} />);
    expect(screen.getByTestId('organization-details-card')).toBeInTheDocument();
  });

  it('does not render header if hideHeader is true', () => {
    renderWithProviders(<OrganizationManagementView {...viewProps} hideHeader={true} />);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('renders header if hideHeader is false', () => {
    renderWithProviders(<OrganizationManagementView {...viewProps} hideHeader={false} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders loading state when isFetchLoading is true', () => {
    renderWithProviders(<OrganizationManagementView {...viewProps} isFetchLoading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not render delete button when deleteAction is not provided', () => {
    renderWithProviders(<OrganizationManagementView {...viewProps} deleteAction={undefined} />);
    expect(screen.queryByTestId('delete-organization-button')).not.toBeInTheDocument();
  });

  it('renders delete button when deleteAction is provided', () => {
    const deleteAction = { disabled: false, onAfter: vi.fn() };
    const management = {
      ...viewProps.management,
      openDeleteModal: vi.fn(),
    };

    renderWithProviders(
      <OrganizationManagementView
        {...viewProps}
        deleteAction={deleteAction}
        management={management}
      />,
    );

    expect(screen.getByTestId('delete-organization-button')).toBeInTheDocument();
  });
});
