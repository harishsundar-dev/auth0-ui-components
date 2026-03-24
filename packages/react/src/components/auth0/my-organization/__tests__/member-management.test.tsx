import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { MemberManagement } from '@/components/auth0/my-organization/member-management';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type {
  MemberManagementProps,
  MemberManagementSdkClient,
  OrganizationRole,
} from '@/types/my-organization/member-management/member-management-types';

// ===== Mock packages =====

mockToast();
mockCore();

// Polyfill for Radix UI components in jsdom
window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
window.HTMLElement.prototype.setPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

// ===== Local mock creators =====

const mockRoles: OrganizationRole[] = [
  { id: 'role-admin', name: 'Admin', description: 'Administrator role' },
  { id: 'role-member', name: 'Member', description: 'Standard member role' },
];

const createMockSdkClient = (
  overrides?: Partial<MemberManagementSdkClient['organization']['members']>,
): MemberManagementSdkClient => ({
  organization: {
    members: {
      list: vi.fn().mockResolvedValue({ total: 0, members: [] }),
      roles: {
        list: vi.fn().mockResolvedValue(mockRoles),
        create: vi.fn().mockResolvedValue(undefined),
      },
      ...overrides,
    },
  },
});

const createMockProps = (overrides?: Partial<MemberManagementProps>): MemberManagementProps => ({
  open: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  sdkClient: createMockSdkClient(),
  variant: 'option1',
  mode: 'single',
  roleInputVariant: 'select',
  ...overrides,
});

// ===== Local utils =====

const waitForDialogToLoad = async () => {
  return await screen.findByRole('dialog');
};

// ===== Tests =====

describe('MemberManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('open', () => {
    describe('when is true', () => {
      it('should render the dialog', async () => {
        renderWithProviders(<MemberManagement {...createMockProps({ open: true })} />);
        await waitForDialogToLoad();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      it('should render the dialog title', async () => {
        renderWithProviders(<MemberManagement {...createMockProps({ open: true })} />);
        await waitForDialogToLoad();
        // With mock translator, t('dialog.title') returns the key 'dialog.title'
        expect(screen.getByText('dialog.title')).toBeInTheDocument();
      });

      it('should render the email input field', async () => {
        renderWithProviders(<MemberManagement {...createMockProps({ open: true })} />);
        await waitForDialogToLoad();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      it('should render the cancel and send invite buttons', async () => {
        renderWithProviders(<MemberManagement {...createMockProps({ open: true })} />);
        await waitForDialogToLoad();
        // With mock translator, button labels return keys: 'buttons.cancel', 'buttons.send_invite'
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send_invite/i })).toBeInTheDocument();
      });
    });

    describe('when is false', () => {
      it('should not render the dialog content', () => {
        renderWithProviders(<MemberManagement {...createMockProps({ open: false })} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('roles', () => {
    describe('when roles are fetched successfully', () => {
      it('should render the role select dropdown', async () => {
        renderWithProviders(<MemberManagement {...createMockProps()} />);
        await waitForDialogToLoad();
        await waitFor(() => {
          expect(screen.getByRole('combobox')).toBeInTheDocument();
        });
      });
    });
  });

  describe('variant', () => {
    describe('when variant is option2', () => {
      it('should render radio group for role selection', async () => {
        renderWithProviders(<MemberManagement {...createMockProps({ variant: 'option2' })} />);
        await waitForDialogToLoad();

        await waitFor(() => {
          expect(screen.getByRole('radiogroup')).toBeInTheDocument();
        });
      });

      it('should render role radio buttons after roles are loaded', async () => {
        renderWithProviders(<MemberManagement {...createMockProps({ variant: 'option2' })} />);
        await waitForDialogToLoad();

        await waitFor(() => {
          expect(screen.getByRole('radio', { name: 'Admin' })).toBeInTheDocument();
          expect(screen.getByRole('radio', { name: 'Member' })).toBeInTheDocument();
        });
      });
    });

    describe('when variant is option1', () => {
      it('should render select combobox for role selection', async () => {
        renderWithProviders(<MemberManagement {...createMockProps({ variant: 'option1' })} />);
        await waitForDialogToLoad();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    describe('when email is invalid', () => {
      it('should show a validation error when submitting with an invalid email', async () => {
        const user = userEvent.setup();
        // Use option1 with radio role picker to avoid Radix Select pointer issues
        renderWithProviders(
          <MemberManagement
            {...createMockProps({ variant: 'option1', roleInputVariant: 'radio' })}
          />,
        );
        await waitForDialogToLoad();

        // Wait for radio buttons to render
        await waitFor(() => {
          expect(screen.getByRole('radio', { name: 'Admin' })).toBeInTheDocument();
        });

        // Type an invalid email in the single email input
        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'not-an-email');

        // Select a role so the button becomes enabled (email is truthy, role is selected)
        await user.click(screen.getByRole('radio', { name: 'Admin' }));

        const sendButton = screen.getByRole('button', { name: /send_invite/i });
        await user.click(sendButton);

        // Mock translator returns key: 'form.email.error_invalid'
        expect(await screen.findByText(/error_invalid/i)).toBeInTheDocument();
      });
    });

    describe('when role is not selected', () => {
      it('should have the send invite button disabled when no role is selected', async () => {
        renderWithProviders(<MemberManagement {...createMockProps()} />);
        await waitForDialogToLoad();

        const emailInput = screen.getByRole('textbox');
        await userEvent.setup().type(emailInput, 'valid@example.com');

        // Button should be disabled when role is not selected
        expect(screen.getByRole('button', { name: /send_invite/i })).toBeDisabled();
      });
    });

    describe('when duplicate member is detected', () => {
      it('should show a warning banner with send anyway button', async () => {
        const user = userEvent.setup();
        const sdkClient = createMockSdkClient({
          list: vi.fn().mockResolvedValue({
            total: 1,
            members: [{ user_id: 'user-123', email: 'existing@example.com' }],
          }),
          roles: {
            list: vi.fn().mockResolvedValue(mockRoles),
            create: vi.fn().mockResolvedValue(undefined),
          },
        });
        renderWithProviders(
          <MemberManagement {...createMockProps({ sdkClient, variant: 'option2' })} />,
        );
        await waitForDialogToLoad();

        // Wait for radio buttons
        await waitFor(() => {
          expect(screen.getByRole('radio', { name: 'Admin' })).toBeInTheDocument();
        });

        // Add email chip
        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'existing@example.com');
        await user.keyboard('{Enter}');

        // Select a role via radio
        await user.click(screen.getByRole('radio', { name: 'Admin' }));

        const sendButton = screen.getByRole('button', { name: /send_invite/i });
        await user.click(sendButton);

        // Mock translator returns key: 'alerts.duplicate_member'
        // Use getAllByText since the text may appear in both the alert and aria-live region
        expect((await screen.findAllByText(/duplicate_member/i)).length).toBeGreaterThan(0);
        expect(screen.getByRole('button', { name: /send_anyway/i })).toBeInTheDocument();
      });
    });

    describe('when invitation is successful', () => {
      it('should show success message and call onSuccess', async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        const sdkClient = createMockSdkClient({
          list: vi.fn().mockResolvedValue({ total: 0, members: [] }),
          roles: {
            list: vi.fn().mockResolvedValue(mockRoles),
            create: vi.fn().mockResolvedValue(undefined),
          },
        });
        renderWithProviders(
          <MemberManagement {...createMockProps({ sdkClient, onSuccess, variant: 'option2' })} />,
        );
        await waitForDialogToLoad();

        await waitFor(() => {
          expect(screen.getByRole('radio', { name: 'Admin' })).toBeInTheDocument();
        });

        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'newmember@example.com');
        await user.keyboard('{Enter}');

        await user.click(screen.getByRole('radio', { name: 'Admin' }));

        const sendButton = screen.getByRole('button', { name: /send_invite/i });
        await user.click(sendButton);

        // Mock translator returns key: 'alerts.success'
        expect(await screen.findByText(/alerts\.success/i)).toBeInTheDocument();
        expect(onSuccess).toHaveBeenCalledWith(['newmember@example.com'], 'role-admin');
      });
    });

    describe('when server returns an error', () => {
      it('should show an error banner', async () => {
        const user = userEvent.setup();
        const sdkClient = createMockSdkClient({
          list: vi.fn().mockRejectedValue(new Error('Server error')),
          roles: {
            list: vi.fn().mockResolvedValue(mockRoles),
            create: vi.fn().mockResolvedValue(undefined),
          },
        });
        renderWithProviders(
          <MemberManagement {...createMockProps({ sdkClient, variant: 'option2' })} />,
        );
        await waitForDialogToLoad();

        await waitFor(() => {
          expect(screen.getByRole('radio', { name: 'Admin' })).toBeInTheDocument();
        });

        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'user@example.com');
        await user.keyboard('{Enter}');

        await user.click(screen.getByRole('radio', { name: 'Admin' }));

        const sendButton = screen.getByRole('button', { name: /send_invite/i });
        await user.click(sendButton);

        // Mock translator returns key: 'alerts.error_generic'
        // Use getAllByText since the text may appear in both the alert and aria-live region
        expect((await screen.findAllByText(/error_generic/i)).length).toBeGreaterThan(0);
      });
    });
  });

  describe('onClose', () => {
    it('should call onClose when the cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithProviders(<MemberManagement {...createMockProps({ onClose })} />);
      await waitForDialogToLoad();

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('customMessages', () => {
    it('should override dialog title when customMessages.dialog.title is provided', async () => {
      renderWithProviders(
        <MemberManagement
          {...createMockProps({
            customMessages: {
              dialog: { title: 'Custom Invite Title' },
            },
          })}
        />,
      );
      await waitForDialogToLoad();
      expect(screen.getByText('Custom Invite Title')).toBeInTheDocument();
    });
  });
});
