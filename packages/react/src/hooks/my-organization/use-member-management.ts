/**
 * Member management hook.
 * @module use-member-management
 */

import { useCallback, useReducer } from 'react';

import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  InviteMemberDialogState,
  InviteMemberErrors,
  UseMemberManagementOptions,
  UseMemberManagementResult,
} from '@/types/my-organization/member-management/member-management-types';

// ===== State machine =====

interface InviteMemberState {
  dialogState: InviteMemberDialogState;
  emails: string[];
  role: string;
  errors: InviteMemberErrors;
  warningEmails: string[];
}

type InviteMemberAction =
  | { type: 'ADD_EMAIL'; payload: string }
  | { type: 'REMOVE_EMAIL'; payload: string }
  | { type: 'SET_ROLE'; payload: string }
  | { type: 'VALIDATE'; payload: InviteMemberErrors }
  | { type: 'CHECK_MEMBERSHIP' }
  | { type: 'WARN'; payload: string[] }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' }
  | { type: 'DISMISS' };

const initialState: InviteMemberState = {
  dialogState: 'idle',
  emails: [],
  role: '',
  errors: {},
  warningEmails: [],
};

/**
 * Reducer for invite member state machine.
 * @param state - Current state.
 * @param action - Action to dispatch.
 * @returns New state.
 * @internal
 */
function inviteMemberReducer(
  state: InviteMemberState,
  action: InviteMemberAction,
): InviteMemberState {
  switch (action.type) {
    case 'ADD_EMAIL':
      return {
        ...state,
        emails: [...state.emails, action.payload],
        errors: { ...state.errors, email: undefined },
      };
    case 'REMOVE_EMAIL':
      return { ...state, emails: state.emails.filter((e) => e !== action.payload) };
    case 'SET_ROLE':
      return { ...state, role: action.payload, errors: { ...state.errors, role: undefined } };
    case 'VALIDATE':
      return { ...state, dialogState: 'validating', errors: action.payload };
    case 'CHECK_MEMBERSHIP':
      return { ...state, dialogState: 'checking_membership', errors: {} };
    case 'WARN':
      return { ...state, dialogState: 'warning', warningEmails: action.payload };
    case 'SUBMIT':
      return { ...state, dialogState: 'submitting', errors: {} };
    case 'SUCCESS':
      return { ...state, dialogState: 'success', errors: {} };
    case 'ERROR':
      return {
        ...state,
        dialogState: 'error',
        errors: { ...state.errors, submission: action.payload },
      };
    case 'DISMISS':
      return { ...state, dialogState: 'idle' };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

// ===== Email validation =====

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address using a basic regex.
 * @param email - Email to validate.
 * @returns Whether the email is valid.
 * @internal
 */
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

// ===== Hook =====

/**
 * Hook managing state and logic for the invite member dialog.
 *
 * Handles email validation, membership checks, submission, and all
 * dialog state transitions (idle → validating → checking_membership →
 * submitting → success | error | warning).
 *
 * @param options - Hook options.
 * @returns Hook state and action handlers.
 */
export function useMemberManagement({
  onInvite,
  onCheckMembership,
  onSuccess,
  customMessages,
}: UseMemberManagementOptions): UseMemberManagementResult {
  const [state, dispatch] = useReducer(inviteMemberReducer, initialState);
  // Use the full customMessages as overrides. Partial<MemberManagementMessages> is a mapped
  // type compatible with Record<string, unknown>. Full paths include the 'invite_member' prefix.
  const { t } = useTranslator('member_management', customMessages);

  const addEmail = useCallback(
    (email: string): void => {
      const trimmed = email.trim();
      if (!trimmed) return;
      if (state.emails.includes(trimmed)) return;
      if (!isValidEmail(trimmed)) return;
      dispatch({ type: 'ADD_EMAIL', payload: trimmed });
    },
    [state.emails],
  );

  const removeEmail = useCallback((email: string): void => {
    dispatch({ type: 'REMOVE_EMAIL', payload: email });
  }, []);

  const setRole = useCallback((role: string): void => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, []);

  const validateForm = useCallback((): InviteMemberErrors => {
    const errors: InviteMemberErrors = {};

    if (state.emails.length === 0) {
      errors.email = t('invite_member.errors.required_email');
    }

    if (!state.role) {
      errors.role = t('invite_member.errors.required_role');
    }

    return errors;
  }, [state.emails, state.role, t]);

  const performSubmit = useCallback(
    async (emailsToInvite: string[]): Promise<void> => {
      dispatch({ type: 'SUBMIT' });
      try {
        await onInvite(emailsToInvite, state.role);
        dispatch({ type: 'SUCCESS' });
        onSuccess?.(emailsToInvite);
      } catch (error) {
        const message = error instanceof Error ? error.message : t('invite_member.errors.generic');
        dispatch({ type: 'ERROR', payload: message });
      }
    },
    [onInvite, state.role, onSuccess, t],
  );

  const submit = useCallback(async (): Promise<void> => {
    // Step 1: Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      dispatch({ type: 'VALIDATE', payload: validationErrors });
      return;
    }

    // Step 2: Check membership (if callback provided)
    if (onCheckMembership) {
      dispatch({ type: 'CHECK_MEMBERSHIP' });
      try {
        const membershipChecks = await Promise.all(
          state.emails.map(async (email) => ({
            email,
            isMember: await onCheckMembership(email),
          })),
        );
        const alreadyMembers = membershipChecks.filter((r) => r.isMember).map((r) => r.email);

        if (alreadyMembers.length > 0) {
          dispatch({ type: 'WARN', payload: alreadyMembers });
          return;
        }
      } catch (membershipCheckError) {
        // If the membership check fails, proceed with submission but do not block the user.
        // This is a best-effort check; the invite API will enforce real membership constraints.
        if (typeof console !== 'undefined') {
          console.warn(
            '[MemberManagement] Membership check failed, proceeding with submission:',
            membershipCheckError,
          );
        }
      }
    }

    // Step 3: Submit
    await performSubmit(state.emails);
  }, [validateForm, onCheckMembership, state.emails, performSubmit]);

  const proceedDespiteWarning = useCallback(async (): Promise<void> => {
    await performSubmit(state.emails);
  }, [performSubmit, state.emails]);

  const dismiss = useCallback((): void => {
    dispatch({ type: 'DISMISS' });
  }, []);

  const reset = useCallback((): void => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    dialogState: state.dialogState,
    emails: state.emails,
    role: state.role,
    errors: state.errors,
    isLoading: state.dialogState === 'submitting' || state.dialogState === 'checking_membership',
    warningEmails: state.warningEmails,
    addEmail,
    removeEmail,
    setRole,
    submit,
    dismiss,
    reset,
    proceedDespiteWarning,
  };
}
