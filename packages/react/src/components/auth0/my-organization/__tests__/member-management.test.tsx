import type { ComponentAction, OrganizationPrivate } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { MemberManagement } from '@/components/auth0/my-organization/member-management';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockOrganization } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-details.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { MemberManagementProps } from '@/types/my-organization/organization-management/member-management-types';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockMemberManagementProps = (
  overrides?: Partial<MemberManagementProps>,
): MemberManagementProps => ({
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly: false,
  saveAction: undefined,
  cancelAction: undefined,
  ssoProviders: undefined,
  domains: undefined,
  ...overrides,
});

const createMockSaveAction = (): ComponentAction<OrganizationPrivate> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

// ===== Local utils =====

const waitForComponentToLoad = async () => {
  return await screen.findByText('Auth0 Corporation');
};

// ===== Tests =====

describe('MemberManagement', () => {
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

  describe('list view', () => {
    describe('when organization exists', () => {
      it('should render the organization management header', async () => {
        renderWithProviders(<MemberManagement {...createMockMemberManagementProps()} />);
        await waitForComponentToLoad();
        expect(screen.getByRole('banner', { name: /header.title/i })).toBeInTheDocument();
      });

      it('should render the organization name in table', async () => {
        renderWithProviders(<MemberManagement {...createMockMemberManagementProps()} />);
        await waitForComponentToLoad();
        expect(screen.getByText('auth0-corp')).toBeInTheDocument();
      });

      it('should render the organization display name in table', async () => {
        renderWithProviders(<MemberManagement {...createMockMemberManagementProps()} />);
        await waitForComponentToLoad();
        expect(screen.getByText('Auth0 Corporation')).toBeInTheDocument();
      });

      it('should render Edit button in the table row', async () => {
        renderWithProviders(<MemberManagement {...createMockMemberManagementProps()} />);
        await waitForComponentToLoad();
        const editButtons = screen.getAllByRole('button', { name: /actions.edit/i });
        expect(editButtons).toHaveLength(1);
      });
    });

    describe('when organization has no name (empty state)', () => {
      it('should render the empty state message', async () => {
        const emptyOrg = { ...mockOrganization, name: '', display_name: '' };
        const apiService = mockCoreClient.getMyOrganizationApiClient();
        (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(
          emptyOrg,
        );

        renderWithProviders(<MemberManagement {...createMockMemberManagementProps()} />);

        await waitFor(() => {
          expect(screen.getByTestId('member-management-empty-state')).toBeInTheDocument();
        });

        expect(screen.getByText('empty_state.title')).toBeInTheDocument();
        expect(screen.getByText('empty_state.description')).toBeInTheDocument();
      });
    });

    describe('when readOnly is true', () => {
      it('should render Edit button as disabled', async () => {
        renderWithProviders(
          <MemberManagement {...createMockMemberManagementProps({ readOnly: true })} />,
        );
        await waitForComponentToLoad();
        const editButtons = screen.getAllByRole('button', { name: /actions.edit/i });
        editButtons.forEach((btn) => {
          expect(btn).toBeDisabled();
        });
      });
    });
  });

  describe('edit view', () => {
    it('should switch to edit view when Edit button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MemberManagement {...createMockMemberManagementProps()} />);
      await waitForComponentToLoad();

      const editButtons = screen.getAllByRole('button', { name: /actions.edit/i });
      await user.click(editButtons[0]!);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /tabs.details/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /tabs.sso_providers/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /tabs.domains/i })).toBeInTheDocument();
      });
    });

    it('should render back button in edit view', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MemberManagement {...createMockMemberManagementProps()} />);
      await waitForComponentToLoad();

      const editButtons = screen.getAllByRole('button', { name: /actions.edit/i });
      await user.click(editButtons[0]!);

      await waitFor(() => {
        expect(screen.getByTestId('member-management-back-button')).toBeInTheDocument();
      });
    });

    it('should return to list view when back button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MemberManagement {...createMockMemberManagementProps()} />);
      await waitForComponentToLoad();

      const editButtons = screen.getAllByRole('button', { name: /actions.edit/i });
      await user.click(editButtons[0]!);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /tabs.details/i })).toBeInTheDocument();
      });

      const backButton = screen.getByTestId('member-management-back-button');
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.queryByRole('tab', { name: /tabs.details/i })).not.toBeInTheDocument();
      });

      expect(screen.getByRole('banner', { name: /header.title/i })).toBeInTheDocument();
    });

    it('should show details tab as active by default in edit view', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MemberManagement {...createMockMemberManagementProps()} />);
      await waitForComponentToLoad();

      const editButtons = screen.getAllByRole('button', { name: /actions.edit/i });
      await user.click(editButtons[0]!);

      await waitFor(() => {
        const detailsTab = screen.getByRole('tab', { name: /tabs.details/i });
        expect(detailsTab).toBeInTheDocument();
        expect(detailsTab).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('saveAction', () => {
    describe('when onBefore returns false', () => {
      it('should not call onAfter', async () => {
        const saveAction = createMockSaveAction();
        (saveAction.onBefore as ReturnType<typeof vi.fn>).mockReturnValue(false);

        renderWithProviders(
          <MemberManagement {...createMockMemberManagementProps({ saveAction })} />,
        );
        await waitForComponentToLoad();

        expect(saveAction.onAfter).not.toHaveBeenCalled();
      });
    });
  });

  describe('customMessages', () => {
    it('should render custom header title when provided', async () => {
      renderWithProviders(
        <MemberManagement
          {...createMockMemberManagementProps({
            customMessages: {
              header: { title: 'Custom Organization Title' },
            },
          })}
        />,
      );

      await waitForComponentToLoad();
      expect(screen.getByText('Custom Organization Title')).toBeInTheDocument();
    });

    it('should render custom empty state messages when provided', async () => {
      const emptyOrg = { ...mockOrganization, name: '', display_name: '' };
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(emptyOrg);

      renderWithProviders(
        <MemberManagement
          {...createMockMemberManagementProps({
            customMessages: {
              empty_state: {
                title: 'Custom Empty Title',
                description: 'Custom empty description',
              },
            },
          })}
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('member-management-empty-state')).toBeInTheDocument();
      });
      expect(screen.getByText('Custom Empty Title')).toBeInTheDocument();
      expect(screen.getByText('Custom empty description')).toBeInTheDocument();
    });
  });
});
