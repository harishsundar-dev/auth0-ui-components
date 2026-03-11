import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useCoreClientModule from '../../../../hooks/use-core-client';
import {
  createMockMembersListProps,
  createMockOrganizationMember,
  createMockMemberRole,
  createMockMembersApiResponse,
  createMockRolesApiResponse,
} from '../../../../internals/__mocks__/my-organization/members/members.mocks';
import { renderWithProviders } from '../../../../internals/test-provider';
import { mockCore, mockToast } from '../../../../internals/test-setup';
import { MembersList } from '../members-list';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local utils =====

const waitForComponentToLoad = async () => {
  return await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
};

// ===== Tests =====
// NOTE: the mock i18n service returns translation keys as-is (e.g. t('title') => 'title')

describe('MembersList', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    // The SDK's organization client does not yet expose `members` or `roles` sub-resources.
    // We cast to `any` here to attach the mock implementations until the SDK is updated.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgAny = apiService.organization as any;

    orgAny.members = {
      list: vi.fn().mockResolvedValue(
        createMockMembersApiResponse(
          [
            createMockOrganizationMember({
              user_id: 'user_1',
              name: 'Alice Smith',
              email: 'alice@example.com',
            }),
            createMockOrganizationMember({
              user_id: 'user_2',
              name: 'Bob Jones',
              email: 'bob@example.com',
            }),
          ],
          2,
        ),
      ),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    orgAny.roles = {
      list: vi
        .fn()
        .mockResolvedValue(
          createMockRolesApiResponse([
            createMockMemberRole({ id: 'role_1', name: 'Admin' }),
            createMockMemberRole({ id: 'role_2', name: 'Viewer' }),
          ]),
        ),
    };

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('should render loading spinner when data is loading', () => {
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      // The SDK's organization client does not yet expose `members` or `roles` sub-resources.
      // We cast to `any` here to attach the mock implementations until the SDK is updated.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orgAny = apiService.organization as any;

      orgAny.members = {
        list: vi.fn().mockImplementation(() => new Promise(() => {})),
        remove: vi.fn(),
      };

      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render members list after loading', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    it('should render members count badge', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should render header title by default', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      // Mock i18n returns the key 'title'
      expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('should not render header when hideHeader is true', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps({ hideHeader: true })} />);
      await waitForComponentToLoad();

      expect(screen.queryByText('title')).not.toBeInTheDocument();
    });
  });

  describe('tabs', () => {
    it('should render Members and Invitations tabs by default', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      // Mock i18n returns the key
      expect(screen.getByRole('tab', { name: 'tabs.members' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'tabs.invitations' })).toBeInTheDocument();
    });

    it('should not render tabs when showInvitationsTab is false', async () => {
      renderWithProviders(
        <MembersList {...createMockMembersListProps({ showInvitationsTab: false })} />,
      );
      await waitForComponentToLoad();

      expect(screen.queryByRole('tab', { name: 'tabs.members' })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'tabs.invitations' })).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should render empty state when there are no members', async () => {
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      // The SDK's organization client does not yet expose `members` or `roles` sub-resources.
      // We cast to `any` here to attach the mock implementations until the SDK is updated.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orgAny = apiService.organization as any;

      orgAny.members.list.mockResolvedValue(createMockMembersApiResponse([], 0));

      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      // Mock i18n returns the key
      expect(screen.getByText('empty.title')).toBeInTheDocument();
      expect(screen.getByText('empty.description')).toBeInTheDocument();
    });
  });

  describe('member selection', () => {
    it('should select a member when checkbox is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      const checkboxes = screen.getAllByRole('checkbox');
      // First checkbox is "select all", skip it
      const memberCheckbox = checkboxes[1];
      if (!memberCheckbox) throw new Error('Member checkbox not found');
      await user.click(memberCheckbox);

      await waitFor(() => {
        // Mock i18n returns 'selection.member_selected' for count=1
        expect(screen.getByText('selection.member_selected')).toBeInTheDocument();
      });
    });

    it('should select all members when select all checkbox is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      // Mock i18n returns 'table.select_all'
      const selectAllCheckbox = screen.getByRole('checkbox', { name: 'table.select_all' });
      await user.click(selectAllCheckbox);

      await waitFor(() => {
        // Mock i18n returns 'selection.members_selected' for count>1
        expect(screen.getByText('selection.members_selected')).toBeInTheDocument();
      });
    });

    it('should deselect all when X button is clicked in selection banner', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      const selectAllCheckbox = screen.getByRole('checkbox', { name: 'table.select_all' });
      await user.click(selectAllCheckbox);

      await waitFor(() => {
        expect(screen.getByText('selection.members_selected')).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: 'Clear selection' });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText('selection.members_selected')).not.toBeInTheDocument();
      });
    });
  });

  describe('search', () => {
    it('should render search input', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      // Mock i18n returns 'search.placeholder'
      expect(screen.getByPlaceholderText('search.placeholder')).toBeInTheDocument();
    });

    it('should call members API with search query after debounce', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      const searchInput = screen.getByPlaceholderText('search.placeholder');
      await user.type(searchInput, 'Alice');

      await waitFor(
        () => {
          const apiService = mockCoreClient.getMyOrganizationApiClient();
          // The SDK's organization client does not yet expose `members` or `roles` sub-resources.
          // We cast to `any` here to attach the mock implementations until the SDK is updated.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const orgAny = apiService.organization as any;
          expect(orgAny.members.list).toHaveBeenCalledWith(
            expect.objectContaining({ search: 'Alice' }),
          );
        },
        { timeout: 1000 },
      );
    });
  });

  describe('pagination', () => {
    it('should render pagination controls when there are members', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    });

    it('should show page range text', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      // Mock i18n returns 'pagination.showing' (keys only, no interpolation)
      expect(screen.getByText('pagination.showing')).toBeInTheDocument();
    });
  });

  describe('onBack', () => {
    it('should render back button when onBack is provided', async () => {
      const onBack = vi.fn();

      renderWithProviders(<MembersList {...createMockMembersListProps({ onBack })} />);
      await waitForComponentToLoad();

      // aria-label = t('back') = 'back'
      expect(screen.getByRole('button', { name: 'back' })).toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      const onBack = vi.fn();

      renderWithProviders(<MembersList {...createMockMembersListProps({ onBack })} />);
      await waitForComponentToLoad();

      await user.click(screen.getByRole('button', { name: 'back' }));
      expect(onBack).toHaveBeenCalledOnce();
    });

    it('should not render back button when onBack is not provided', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps({ onBack: undefined })} />);
      await waitForComponentToLoad();

      expect(screen.queryByRole('button', { name: 'back' })).not.toBeInTheDocument();
    });
  });

  describe('onInviteMember', () => {
    it('should render invite member button when not readOnly', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps({ readOnly: false })} />);
      await waitForComponentToLoad();

      // aria-label = t('invite_member') = 'invite_member'
      expect(screen.getByRole('button', { name: 'invite_member' })).toBeInTheDocument();
    });

    it('should call onInviteMember when invite button is clicked', async () => {
      const user = userEvent.setup();
      const onInviteMember = vi.fn();

      renderWithProviders(
        <MembersList {...createMockMembersListProps({ onInviteMember, readOnly: false })} />,
      );
      await waitForComponentToLoad();

      await user.click(screen.getByRole('button', { name: 'invite_member' }));
      expect(onInviteMember).toHaveBeenCalledOnce();
    });

    it('should not render invite member button when readOnly', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps({ readOnly: true })} />);
      await waitForComponentToLoad();

      expect(screen.queryByRole('button', { name: 'invite_member' })).not.toBeInTheDocument();
    });
  });

  describe('member roles', () => {
    it('should render role badges for members', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      const adminBadges = screen.getAllByText('Admin');
      expect(adminBadges.length).toBeGreaterThan(0);
    });
  });

  describe('role filter', () => {
    it('should render role filter dropdown when roles are available', async () => {
      renderWithProviders(<MembersList {...createMockMembersListProps()} />);
      await waitForComponentToLoad();

      expect(screen.getByRole('combobox', { name: 'Filter by role' })).toBeInTheDocument();
    });
  });

  describe('onMemberClick', () => {
    it('should call onMemberClick when a member row cell is clicked', async () => {
      const user = userEvent.setup();
      const onMemberClick = vi.fn();

      renderWithProviders(<MembersList {...createMockMembersListProps({ onMemberClick })} />);
      await waitForComponentToLoad();

      await user.click(screen.getByText('Alice Smith'));
      expect(onMemberClick).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user_1', name: 'Alice Smith' }),
      );
    });
  });
});
