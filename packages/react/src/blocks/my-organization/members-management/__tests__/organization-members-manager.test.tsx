import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useCoreClientModule from '../../../../hooks/use-core-client';
import {
  createMockMemberInvitation,
  createMockOrganizationMember,
  createMockMemberRole,
} from '../../../../internals/__mocks__/my-organization/members-management/members.mocks';
import { renderWithProviders } from '../../../../internals/test-provider';
import { mockCore, mockToast } from '../../../../internals/test-setup';
import type { OrganizationMembersManagerProps } from '../../../../types/my-organization/members-management';
import { OrganizationMembersManager } from '../organization-members-manager';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockProps = (
  overrides?: Partial<OrganizationMembersManagerProps>,
): OrganizationMembersManagerProps => ({
  customMessages: {},
  readOnly: false,
  initialTab: 'members',
  ...overrides,
});

// ===== Local utils =====

const waitForComponentToLoad = async () => {
  return await screen.findByText(/header.invite_button_text/i);
};

// ===== Tests =====

describe('OrganizationMembersManager', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    const orgApi = apiService.organization as unknown as {
      members: {
        list: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
      };
      memberInvitations: {
        list: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
      };
      memberRoles: {
        list: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
    };

    orgApi.members.list.mockResolvedValue({ members: [], total: 0 });
    orgApi.memberInvitations.list.mockResolvedValue({ invitations: [] });
    orgApi.memberRoles.list.mockResolvedValue({ roles: [] });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('should render the members manager with header', async () => {
      renderWithProviders(<OrganizationMembersManager {...createMockProps()} />);

      await waitForComponentToLoad();

      expect(screen.getByText(/header.title/i)).toBeInTheDocument();
    });

    it('should render members and invitations tabs', async () => {
      renderWithProviders(<OrganizationMembersManager {...createMockProps()} />);

      await waitForComponentToLoad();

      expect(screen.getByText(/tabs.members/i)).toBeInTheDocument();
      expect(screen.getByText(/tabs.invitations/i)).toBeInTheDocument();
    });
  });

  describe('members tab', () => {
    it('should render members table with empty state when no members', async () => {
      renderWithProviders(<OrganizationMembersManager {...createMockProps()} />);

      await waitForComponentToLoad();

      await waitFor(() => {
        expect(screen.getByText(/members_tab.table.empty_message/i)).toBeInTheDocument();
      });
    });

    it('should render member rows when members are present', async () => {
      const mockMember = createMockOrganizationMember();
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (
        apiService.organization as unknown as {
          members: { list: ReturnType<typeof vi.fn> };
        }
      ).members.list.mockResolvedValue({
        members: [
          {
            user_id: mockMember.userId,
            email: mockMember.email,
            name: mockMember.name,
            roles: mockMember.roles,
            last_login: mockMember.lastLogin,
            created_at: mockMember.createdAt,
          },
        ],
        total: 1,
      });

      renderWithProviders(<OrganizationMembersManager {...createMockProps()} />);

      await waitForComponentToLoad();

      await waitFor(() => {
        expect(screen.getByText(mockMember.name)).toBeInTheDocument();
        expect(screen.getByText(mockMember.email)).toBeInTheDocument();
      });
    });
  });

  describe('invitations tab', () => {
    it('should render invitations table when invitations tab is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationMembersManager {...createMockProps()} />);

      await waitForComponentToLoad();

      const invitationsTab = screen.getByText(/tabs.invitations/i);
      await user.click(invitationsTab);

      expect(screen.getByText(/invitations_tab.table.empty_message/i)).toBeInTheDocument();
    });

    it('should render invitation rows when invitations are present', async () => {
      const user = userEvent.setup();
      const mockInvitation = createMockMemberInvitation();
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (
        apiService.organization as unknown as {
          memberInvitations: { list: ReturnType<typeof vi.fn> };
        }
      ).memberInvitations.list.mockResolvedValue({
        invitations: [
          {
            id: mockInvitation.id,
            invitee: { email: mockInvitation.inviteeEmail },
            roles: mockInvitation.roles,
            inviter: { name: mockInvitation.invitedBy },
            created_at: mockInvitation.createdAt,
            expires_at: mockInvitation.expiresAt,
            status: mockInvitation.status,
          },
        ],
      });

      renderWithProviders(<OrganizationMembersManager {...createMockProps()} />);

      await waitForComponentToLoad();

      const invitationsTab = screen.getByText(/tabs.invitations/i);
      await user.click(invitationsTab);

      await waitFor(() => {
        expect(screen.getByText(mockInvitation.inviteeEmail)).toBeInTheDocument();
      });
    });
  });

  describe('invite dialog', () => {
    it('should open invite dialog when invite button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationMembersManager {...createMockProps()} />);

      await waitForComponentToLoad();

      const inviteButton = screen.getByText(/header.invite_button_text/i);
      await user.click(inviteButton);

      expect(screen.getByText(/invite_member_dialog.title/i)).toBeInTheDocument();
    });

    it('should close invite dialog when cancel is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationMembersManager {...createMockProps()} />);

      await waitForComponentToLoad();

      const inviteButton = screen.getByText(/header.invite_button_text/i);
      await user.click(inviteButton);

      expect(screen.getByText(/invite_member_dialog.title/i)).toBeInTheDocument();

      const cancelButton = screen.getByText(/invite_member_dialog.cancel_button/i);
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/invite_member_dialog.title/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('readOnly', () => {
    it('should not render invite button when readOnly is true', async () => {
      renderWithProviders(<OrganizationMembersManager {...createMockProps({ readOnly: true })} />);

      await waitFor(() => {
        expect(screen.queryByText(/header.invite_button_text/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('customMessages', () => {
    it('should override header title when custom message is provided', async () => {
      const customMessages = {
        header: {
          title: 'Custom Members Title',
        },
      };

      renderWithProviders(<OrganizationMembersManager {...createMockProps({ customMessages })} />);

      await waitFor(() => {
        expect(screen.getByText('Custom Members Title')).toBeInTheDocument();
      });
    });
  });

  describe('initialTab', () => {
    it('should start on invitations tab when initialTab is invitations', async () => {
      const mockRole = createMockMemberRole();
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (
        apiService.organization as unknown as {
          memberRoles: { list: ReturnType<typeof vi.fn> };
        }
      ).memberRoles.list.mockResolvedValue({ roles: [mockRole] });

      renderWithProviders(
        <OrganizationMembersManager {...createMockProps({ initialTab: 'invitations' })} />,
      );

      await waitFor(() => {
        expect(screen.getByText(/invitations_tab.table.empty_message/i)).toBeInTheDocument();
      });
    });
  });

  describe('remove member', () => {
    it('should open remove dialog when remove button is clicked', async () => {
      const user = userEvent.setup();
      const mockMember = createMockOrganizationMember();
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (
        apiService.organization as unknown as {
          members: { list: ReturnType<typeof vi.fn> };
        }
      ).members.list.mockResolvedValue({
        members: [
          {
            user_id: mockMember.userId,
            email: mockMember.email,
            name: mockMember.name,
            roles: mockMember.roles,
            last_login: mockMember.lastLogin,
            created_at: mockMember.createdAt,
          },
        ],
        total: 1,
      });

      renderWithProviders(<OrganizationMembersManager {...createMockProps()} />);

      await waitForComponentToLoad();

      await waitFor(() => {
        expect(screen.getByText(mockMember.name)).toBeInTheDocument();
      });

      const removeButton = screen.getByRole('button', {
        name: /members_tab.table.actions.remove/i,
      });
      await user.click(removeButton);

      expect(screen.getByText(/remove_member_dialog.title/i)).toBeInTheDocument();
    });
  });
});
