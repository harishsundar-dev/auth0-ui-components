import type { CoreClientInterface } from '@auth0/universal-components-core';
import type { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { MemberManagement } from '@/components/auth0/my-organization/member-management';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createTestQueryClient, renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { MemberManagementProps } from '@/types/my-organization/member-management';

mockToast();
const { initMockCoreClient } = mockCore();

const createMockProps = (overrides?: Partial<MemberManagementProps>): MemberManagementProps => ({
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly: false,
  ...overrides,
});

const waitForComponentToLoad = async () => {
  return await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });
};

describe('MemberManagement', () => {
  let mockCoreClient: CoreClientInterface;
  let queryClient: QueryClient;

  const renderBlock = (overrides?: Partial<MemberManagementProps>) =>
    renderWithProviders(<MemberManagement {...createMockProps(overrides)} />, {
      queryClient,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    queryClient = createTestQueryClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organization.members.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      members: [
        {
          user_id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          roles: [{ id: 'role-1', name: 'Admin' }],
          last_login: '2024-01-15T00:00:00Z',
        },
        {
          user_id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          roles: [{ id: 'role-2', name: 'Member' }],
          last_login: '2024-01-10T00:00:00Z',
        },
      ],
    });

    (apiService.organization.invitations.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      invitations: [
        {
          id: 'inv-1',
          invitee: { email: 'pending@example.com' },
          inviter: { name: 'Admin User' },
          created_at: '2024-01-01T00:00:00Z',
          expires_at: '2025-01-08T00:00:00Z',
          invitation_url: 'https://example.com/invite/123',
        },
      ],
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('should render the members tab by default', async () => {
      renderBlock();
      await waitForComponentToLoad();

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should render tabs for members and invitations', async () => {
      renderBlock();
      await waitForComponentToLoad();

      expect(screen.getByRole('tab', { name: /members/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /invitations/i })).toBeInTheDocument();
    });
  });

  describe('tab switching', () => {
    it('should switch to invitations tab when clicked', async () => {
      const user = userEvent.setup();
      renderBlock();
      await waitForComponentToLoad();

      const invitationsTab = screen.getByRole('tab', { name: /invitations/i });
      await user.click(invitationsTab);

      await waitFor(() => {
        expect(screen.getByText('pending@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('readOnly', () => {
    it('should hide invite button when readOnly is true', async () => {
      renderBlock({ readOnly: true });
      await waitForComponentToLoad();

      expect(screen.queryByRole('button', { name: /invite member/i })).not.toBeInTheDocument();
    });
  });

  describe('customMessages', () => {
    it('should override header title with custom message', async () => {
      renderBlock({
        customMessages: {
          header: { title: 'Custom Members Title' },
        },
      });
      await waitForComponentToLoad();

      expect(screen.getByText('Custom Members Title')).toBeInTheDocument();
    });
  });
});
