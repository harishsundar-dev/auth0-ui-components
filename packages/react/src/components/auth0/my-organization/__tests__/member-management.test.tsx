import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { MemberManagement } from '@/components/auth0/my-organization/member-management';
import * as useMemberManagementModule from '@/hooks/my-organization/use-member-management';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type {
  MemberManagementProps,
  MemberRole,
  UseMemberManagementResult,
} from '@/types/my-organization/member-management/member-management-types';

// ===== Mock packages =====

mockToast();
mockCore();

// ===== Test data =====

const mockRoles: MemberRole[] = [
  { id: 'role-admin', name: 'Admin', description: 'Full admin access' },
  { id: 'role-member', name: 'Member', description: 'Standard member access' },
  { id: 'role-viewer', name: 'Viewer', description: 'Read-only access' },
];

const createMockProps = (overrides?: Partial<MemberManagementProps>): MemberManagementProps => ({
  open: true,
  onOpenChange: vi.fn(),
  availableRoles: mockRoles,
  onInvite: vi.fn().mockResolvedValue(undefined),
  onSuccess: vi.fn(),
  variant: 'option1',
  roleInputVariant: 'radio',
  ...overrides,
});

const createMockHookResult = (
  overrides?: Partial<UseMemberManagementResult>,
): UseMemberManagementResult => ({
  dialogState: 'idle',
  emails: [],
  role: '',
  errors: {},
  isLoading: false,
  warningEmails: [],
  addEmail: vi.fn(),
  removeEmail: vi.fn(),
  setRole: vi.fn(),
  submit: vi.fn(),
  dismiss: vi.fn(),
  reset: vi.fn(),
  proceedDespiteWarning: vi.fn(),
  ...overrides,
});

const waitForDialogToLoad = async () => {
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
};

// ===== Tests =====

describe('MemberManagement', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('open', () => {
    describe('when is true', () => {
      it('should render the dialog', async () => {
        renderWithProviders(<MemberManagement {...createMockProps({ open: true })} />);

        await waitForDialogToLoad();

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      it('should render the dialog title', async () => {
        renderWithProviders(<MemberManagement {...createMockProps()} />);

        await waitForDialogToLoad();

        expect(screen.getByText('invite_member.dialog.title')).toBeInTheDocument();
      });

      it('should render the email input', async () => {
        renderWithProviders(<MemberManagement {...createMockProps()} />);

        await waitForDialogToLoad();

        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });

    describe('when is false', () => {
      it('should not render the dialog', () => {
        renderWithProviders(<MemberManagement {...createMockProps({ open: false })} />);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('variant', () => {
    describe('when option1 (single email)', () => {
      it('should render a single email text field', async () => {
        renderWithProviders(<MemberManagement {...createMockProps({ variant: 'option1' })} />);

        await waitForDialogToLoad();

        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });

    describe('when option2 (multi-email chip)', () => {
      it('should render the chip input container', async () => {
        renderWithProviders(<MemberManagement {...createMockProps({ variant: 'option2' })} />);

        await waitForDialogToLoad();

        const chipInput = screen.getByRole('textbox', {
          name: /invite_member.form.email_label/i,
        });
        expect(chipInput).toBeInTheDocument();
      });
    });
  });

  describe('roleInputVariant', () => {
    describe('when radio', () => {
      it('should render radio buttons for each role', async () => {
        renderWithProviders(
          <MemberManagement {...createMockProps({ roleInputVariant: 'radio' })} />,
        );

        await waitForDialogToLoad();

        const radioButtons = screen.getAllByRole('radio');
        expect(radioButtons).toHaveLength(mockRoles.length);
      });

      it('should render each role name as a radio label', async () => {
        renderWithProviders(
          <MemberManagement {...createMockProps({ roleInputVariant: 'radio' })} />,
        );

        await waitForDialogToLoad();

        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('Member')).toBeInTheDocument();
        expect(screen.getByText('Viewer')).toBeInTheDocument();
      });
    });

    describe('when select', () => {
      it('should render a combobox trigger', async () => {
        renderWithProviders(
          <MemberManagement {...createMockProps({ roleInputVariant: 'select' })} />,
        );

        await waitForDialogToLoad();

        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });
  });

  describe('form validation', () => {
    describe('when email is empty on submit', () => {
      it('should show email required error', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <MemberManagement {...createMockProps({ roleInputVariant: 'radio' })} />,
        );

        await waitForDialogToLoad();

        const sendButton = screen.getByText('invite_member.buttons.send_invite');
        await user.click(sendButton);

        await waitFor(() => {
          expect(screen.getByText('invite_member.errors.required_email')).toBeInTheDocument();
        });
      });
    });

    describe('when email is entered but role is not selected', () => {
      it('should show role required error', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <MemberManagement {...createMockProps({ roleInputVariant: 'radio' })} />,
        );

        await waitForDialogToLoad();

        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'test@example.com');
        await user.tab();

        const sendButton = screen.getByText('invite_member.buttons.send_invite');
        await user.click(sendButton);

        await waitFor(() => {
          expect(screen.getByText('invite_member.errors.required_role')).toBeInTheDocument();
        });
      });
    });
  });

  describe('submit', () => {
    describe('when form is valid with radio role selection', () => {
      it('should call onInvite with email and role', async () => {
        const onInvite = vi.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();

        renderWithProviders(
          <MemberManagement {...createMockProps({ onInvite, roleInputVariant: 'radio' })} />,
        );

        await waitForDialogToLoad();

        // Enter email
        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'test@example.com');
        await user.tab();

        // Select role via radio
        const adminRadio = screen.getByRole('radio', { name: /Admin/i });
        await user.click(adminRadio);

        // Submit
        const sendButton = screen.getByText('invite_member.buttons.send_invite');
        await user.click(sendButton);

        await waitFor(() => {
          expect(onInvite).toHaveBeenCalledWith(['test@example.com'], 'role-admin');
        });
      });

      it('should show success state after successful invite', async () => {
        const onInvite = vi.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();

        renderWithProviders(
          <MemberManagement {...createMockProps({ onInvite, roleInputVariant: 'radio' })} />,
        );

        await waitForDialogToLoad();

        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'test@example.com');
        await user.tab();

        const adminRadio = screen.getByRole('radio', { name: /Admin/i });
        await user.click(adminRadio);

        const sendButton = screen.getByText('invite_member.buttons.send_invite');
        await user.click(sendButton);

        await waitFor(() => {
          expect(screen.getByText('invite_member.success.title')).toBeInTheDocument();
        });
      });

      it('should call onSuccess with invited emails', async () => {
        const onInvite = vi.fn().mockResolvedValue(undefined);
        const onSuccess = vi.fn();
        const user = userEvent.setup();

        renderWithProviders(
          <MemberManagement
            {...createMockProps({ onInvite, onSuccess, roleInputVariant: 'radio' })}
          />,
        );

        await waitForDialogToLoad();

        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'test@example.com');
        await user.tab();

        const adminRadio = screen.getByRole('radio', { name: /Admin/i });
        await user.click(adminRadio);

        const sendButton = screen.getByText('invite_member.buttons.send_invite');
        await user.click(sendButton);

        await waitFor(() => {
          expect(onSuccess).toHaveBeenCalledWith(['test@example.com']);
        });
      });
    });

    describe('when onInvite rejects', () => {
      it('should show error state', async () => {
        const onInvite = vi.fn().mockRejectedValue(new Error('API Error'));
        const user = userEvent.setup();

        renderWithProviders(
          <MemberManagement {...createMockProps({ onInvite, roleInputVariant: 'radio' })} />,
        );

        await waitForDialogToLoad();

        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'test@example.com');
        await user.tab();

        const adminRadio = screen.getByRole('radio', { name: /Admin/i });
        await user.click(adminRadio);

        const sendButton = screen.getByText('invite_member.buttons.send_invite');
        await user.click(sendButton);

        await waitFor(() => {
          expect(screen.getByText('invite_member.errors.generic')).toBeInTheDocument();
        });
      });

      it('should show the specific error message in the submission error', async () => {
        const onInvite = vi.fn().mockRejectedValue(new Error('Permission denied'));
        const user = userEvent.setup();

        renderWithProviders(
          <MemberManagement {...createMockProps({ onInvite, roleInputVariant: 'radio' })} />,
        );

        await waitForDialogToLoad();

        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'test@example.com');
        await user.tab();

        const adminRadio = screen.getByRole('radio', { name: /Admin/i });
        await user.click(adminRadio);

        const sendButton = screen.getByText('invite_member.buttons.send_invite');
        await user.click(sendButton);

        await waitFor(() => {
          expect(screen.getByText('Permission denied')).toBeInTheDocument();
        });
      });
    });
  });

  describe('membership check', () => {
    describe('when onCheckMembership returns true for an email', () => {
      it('should show warning state', async () => {
        const onCheckMembership = vi.fn().mockResolvedValue(true);
        const user = userEvent.setup();

        renderWithProviders(
          <MemberManagement
            {...createMockProps({ onCheckMembership, roleInputVariant: 'radio' })}
          />,
        );

        await waitForDialogToLoad();

        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'existing@example.com');
        await user.tab();

        const adminRadio = screen.getByRole('radio', { name: /Admin/i });
        await user.click(adminRadio);

        const sendButton = screen.getByText('invite_member.buttons.send_invite');
        await user.click(sendButton);

        await waitFor(() => {
          expect(screen.getByText('invite_member.warning.already_member')).toBeInTheDocument();
        });
      });

      it('should show proceed button when in warning state', async () => {
        const onCheckMembership = vi.fn().mockResolvedValue(true);
        const user = userEvent.setup();

        renderWithProviders(
          <MemberManagement
            {...createMockProps({ onCheckMembership, roleInputVariant: 'radio' })}
          />,
        );

        await waitForDialogToLoad();

        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'existing@example.com');
        await user.tab();

        const adminRadio = screen.getByRole('radio', { name: /Admin/i });
        await user.click(adminRadio);

        const sendButton = screen.getByText('invite_member.buttons.send_invite');
        await user.click(sendButton);

        await waitFor(() => {
          expect(screen.getByText('invite_member.buttons.proceed')).toBeInTheDocument();
        });
      });

      it('should invoke onInvite when proceeding despite warning', async () => {
        const onInvite = vi.fn().mockResolvedValue(undefined);
        const onCheckMembership = vi.fn().mockResolvedValue(true);
        const user = userEvent.setup();

        renderWithProviders(
          <MemberManagement
            {...createMockProps({ onInvite, onCheckMembership, roleInputVariant: 'radio' })}
          />,
        );

        await waitForDialogToLoad();

        const emailInput = screen.getByRole('textbox');
        await user.type(emailInput, 'existing@example.com');
        await user.tab();

        const adminRadio = screen.getByRole('radio', { name: /Admin/i });
        await user.click(adminRadio);

        // Trigger warning
        const sendButton = screen.getByText('invite_member.buttons.send_invite');
        await user.click(sendButton);

        await waitFor(() => {
          expect(screen.getByText('invite_member.buttons.proceed')).toBeInTheDocument();
        });

        // Proceed
        const proceedButton = screen.getByText('invite_member.buttons.proceed');
        await user.click(proceedButton);

        await waitFor(() => {
          expect(onInvite).toHaveBeenCalledWith(['existing@example.com'], 'role-admin');
        });
      });
    });
  });

  describe('cancel button', () => {
    it('should call onOpenChange with false', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();

      renderWithProviders(<MemberManagement {...createMockProps({ onOpenChange })} />);

      await waitForDialogToLoad();

      const cancelButton = screen.getByText('invite_member.buttons.cancel');
      await user.click(cancelButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('option2 chip input', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should add email chip when Enter is pressed', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MemberManagement {...createMockProps({ variant: 'option2' })} />);

      await waitForDialogToLoad();

      const chipInput = screen.getByRole('textbox', {
        name: /invite_member.form.email_label/i,
      });
      await user.type(chipInput, 'chip@example.com');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('chip@example.com')).toBeInTheDocument();
      });
    });

    it('should add email chip when comma is pressed', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MemberManagement {...createMockProps({ variant: 'option2' })} />);

      await waitForDialogToLoad();

      const chipInput = screen.getByRole('textbox', {
        name: /invite_member.form.email_label/i,
      });
      await user.type(chipInput, 'chip@example.com,');

      await waitFor(() => {
        expect(screen.getByText('chip@example.com')).toBeInTheDocument();
      });
    });

    it('should remove email chip when remove button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MemberManagement {...createMockProps({ variant: 'option2' })} />);

      await waitForDialogToLoad();

      // Add a chip
      const chipInput = screen.getByRole('textbox', {
        name: /invite_member.form.email_label/i,
      });
      await user.type(chipInput, 'chip@example.com');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('chip@example.com')).toBeInTheDocument();
      });

      // Remove it
      const removeButton = screen.getByRole('button', {
        name: /invite_member.chip.remove/i,
      });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('chip@example.com')).not.toBeInTheDocument();
      });
    });

    it('should remove last chip when Backspace is pressed on empty input', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MemberManagement {...createMockProps({ variant: 'option2' })} />);

      await waitForDialogToLoad();

      // Add a chip
      const chipInput = screen.getByRole('textbox', {
        name: /invite_member.form.email_label/i,
      });
      await user.type(chipInput, 'chip@example.com');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('chip@example.com')).toBeInTheDocument();
      });

      // Focus input and press Backspace
      await user.click(chipInput);
      await user.keyboard('{Backspace}');

      await waitFor(() => {
        expect(screen.queryByText('chip@example.com')).not.toBeInTheDocument();
      });
    });

    it('should not add duplicate emails', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MemberManagement {...createMockProps({ variant: 'option2' })} />);

      await waitForDialogToLoad();

      const chipInput = screen.getByRole('textbox', {
        name: /invite_member.form.email_label/i,
      });

      // Add same email twice
      await user.type(chipInput, 'dup@example.com');
      await user.keyboard('{Enter}');
      await user.type(chipInput, 'dup@example.com');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        const chips = screen.getAllByText('dup@example.com');
        expect(chips).toHaveLength(1);
      });
    });
  });

  describe('success state', () => {
    it('should show dismiss button after success', async () => {
      vi.spyOn(useMemberManagementModule, 'useMemberManagement').mockReturnValue(
        createMockHookResult({ dialogState: 'success', emails: ['done@example.com'] }),
      );

      renderWithProviders(<MemberManagement {...createMockProps()} />);

      await waitForDialogToLoad();

      expect(screen.getByText('invite_member.success.title')).toBeInTheDocument();
      expect(screen.getByText('invite_member.buttons.dismiss')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show generic error banner when dialog state is error', async () => {
      vi.spyOn(useMemberManagementModule, 'useMemberManagement').mockReturnValue(
        createMockHookResult({
          dialogState: 'error',
          errors: { submission: 'Something went wrong' },
        }),
      );

      renderWithProviders(<MemberManagement {...createMockProps()} />);

      await waitForDialogToLoad();

      expect(screen.getByText('invite_member.errors.generic')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading text when submitting', async () => {
      vi.spyOn(useMemberManagementModule, 'useMemberManagement').mockReturnValue(
        createMockHookResult({ dialogState: 'submitting', isLoading: true }),
      );

      renderWithProviders(<MemberManagement {...createMockProps()} />);

      await waitForDialogToLoad();

      expect(screen.getByText('invite_member.loading.submitting')).toBeInTheDocument();
    });

    it('should show checking text when checking membership', async () => {
      vi.spyOn(useMemberManagementModule, 'useMemberManagement').mockReturnValue(
        createMockHookResult({ dialogState: 'checking_membership', isLoading: true }),
      );

      renderWithProviders(<MemberManagement {...createMockProps()} />);

      await waitForDialogToLoad();

      expect(screen.getByText('invite_member.loading.checking')).toBeInTheDocument();
    });
  });
});
