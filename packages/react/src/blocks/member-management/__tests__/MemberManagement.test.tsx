import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemberManagement } from '../MemberManagement';
import type {
  OrganizationInvitation,
  OrganizationMember,
  OrganizationRole,
  OrganizationSDKClient,
} from '../MemberManagement.types';

const mockRoles: OrganizationRole[] = [
  { id: 'role-1', name: 'Admin', description: 'Administrator' },
  { id: 'role-2', name: 'Member', description: 'Regular member' },
];

const mockMembers: OrganizationMember[] = [
  {
    user_id: 'user-1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    last_login: '2024-01-15T10:00:00Z',
    roles: [mockRoles[0]!],
  },
  {
    user_id: 'user-2',
    name: 'Bob Jones',
    email: 'bob@example.com',
    last_login: '2024-01-10T08:00:00Z',
    roles: [],
  },
];

const mockInvitations: OrganizationInvitation[] = [
  {
    id: 'inv-1',
    invitee: { email: 'charlie@example.com' },
    inviter: { name: 'Alice Smith' },
    roles: [mockRoles[1]!],
    created_at: '2024-01-14T09:00:00Z',
    ticket_expiration_at: '2024-01-21T09:00:00Z',
    status: 'pending',
    invitation_url: 'https://example.auth0.com/invite/abc123',
  },
];

function createMockClient(
  overrides?: Partial<OrganizationSDKClient['organization']>,
): OrganizationSDKClient {
  return {
    organization: {
      members: {
        list: vi.fn().mockResolvedValue({ members: mockMembers, total: 2 }),
        get: vi.fn().mockResolvedValue(mockMembers[0]),
        deleteMembers: vi.fn().mockResolvedValue(undefined),
        roles: {
          list: vi.fn().mockResolvedValue(mockRoles),
          create: vi.fn().mockResolvedValue(undefined),
          delete: vi.fn().mockResolvedValue(undefined),
        },
      },
      memberships: {
        deleteMemberships: vi.fn().mockResolvedValue(undefined),
      },
      invitations: {
        list: vi.fn().mockResolvedValue({ invitations: mockInvitations, total: 1 }),
        create: vi.fn().mockResolvedValue(mockInvitations[0]),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      roles: {
        list: vi.fn().mockResolvedValue(mockRoles),
      },
      ...overrides,
    },
  };
}

const defaultProps = {
  orgId: 'org-123',
  orgName: 'Test Organization',
};

describe('MemberManagement', () => {
  let mockClient: OrganizationSDKClient;

  beforeEach(() => {
    mockClient = createMockClient();
  });

  describe('rendering', () => {
    it('should render the tabs', async () => {
      render(<MemberManagement {...defaultProps} client={mockClient} />);
      expect(screen.getByRole('tab', { name: 'Members' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Invitations' })).toBeInTheDocument();
    });

    it('should default to the members tab', () => {
      render(<MemberManagement {...defaultProps} client={mockClient} />);
      expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('data-state', 'active');
    });

    it('should render with defaultTab=invitations', () => {
      render(<MemberManagement {...defaultProps} client={mockClient} defaultTab="invitations" />);
      expect(screen.getByRole('tab', { name: 'Invitations' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });
  });

  describe('members tab', () => {
    it('should show loading state initially', () => {
      mockClient.organization.members.list = vi.fn().mockImplementation(() => new Promise(() => {}));
      render(<MemberManagement {...defaultProps} client={mockClient} />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render member list after loading', async () => {
      render(<MemberManagement {...defaultProps} client={mockClient} />);
      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      });
    });

    it('should show empty state when no members', async () => {
      mockClient.organization.members.list = vi
        .fn()
        .mockResolvedValue({ members: [], total: 0 });
      render(<MemberManagement {...defaultProps} client={mockClient} />);
      await waitFor(() => {
        expect(screen.getByText('No members found')).toBeInTheDocument();
      });
    });

    it('should show error state on failure', async () => {
      mockClient.organization.members.list = vi
        .fn()
        .mockRejectedValue(new Error('Network error'));
      render(<MemberManagement {...defaultProps} client={mockClient} />);
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should show invite member button', async () => {
      render(<MemberManagement {...defaultProps} client={mockClient} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /invite member/i })).toBeInTheDocument();
      });
    });
  });

  describe('tab switching', () => {
    it('should switch to invitations tab when clicked', async () => {
      const user = userEvent.setup();
      render(<MemberManagement {...defaultProps} client={mockClient} />);
      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('tab', { name: 'Invitations' }));
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Invitations' })).toHaveAttribute(
          'data-state',
          'active',
        );
      });
    });
  });

  describe('invitations tab', () => {
    it('should render invitations after switching tabs', async () => {
      const user = userEvent.setup();
      render(<MemberManagement {...defaultProps} client={mockClient} />);
      await user.click(screen.getByRole('tab', { name: 'Invitations' }));
      await waitFor(() => {
        expect(screen.getByText('charlie@example.com')).toBeInTheDocument();
      });
    });

    it('should show empty state when no invitations', async () => {
      mockClient.organization.invitations.list = vi
        .fn()
        .mockResolvedValue({ invitations: [], total: 0 });
      const user = userEvent.setup();
      render(<MemberManagement {...defaultProps} client={mockClient} />);
      await user.click(screen.getByRole('tab', { name: 'Invitations' }));
      await waitFor(() => {
        expect(screen.getByText('No invitations found')).toBeInTheDocument();
      });
    });
  });

  describe('member selection', () => {
    it('should show bulk toolbar when members are selected', async () => {
      const user = userEvent.setup();
      render(<MemberManagement {...defaultProps} client={mockClient} />);
      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });
      const checkbox = screen.getByLabelText('Select Alice Smith');
      await user.click(checkbox);
      await waitFor(() => {
        expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toBeInTheDocument();
      });
    });
  });
});
