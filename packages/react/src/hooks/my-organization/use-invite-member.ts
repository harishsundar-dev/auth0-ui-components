/**
 * Orchestration hook for the invite member form.
 * Owns the full state machine for the invite flow.
 * @module use-invite-member
 */

import { useCallback, useReducer } from 'react';

import { useCheckMembership } from '@/hooks/my-organization/use-check-membership';
import { useRolesList } from '@/hooks/my-organization/use-roles-list';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  InviteMemberAction,
  InviteMemberState,
  UseInviteMemberOptions,
  UseInviteMemberResult,
} from '@/types/my-organization/member-management/member-management-types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState = (email = ''): InviteMemberState => ({
  email,
  emails: email ? [email] : [],
  role: '',
  status: 'idle',
  errorMsg: null,
  warnMsg: null,
  fieldErrors: {},
});

/**
 * State reducer for invite member form.
 * @param state - Current state
 * @param action - Dispatched action
 * @returns New state
 * @internal
 */
function reducer(state: InviteMemberState, action: InviteMemberAction): InviteMemberState {
  switch (action.type) {
    case 'SET_EMAIL':
      return {
        ...state,
        email: action.payload,
        fieldErrors: { ...state.fieldErrors, email: undefined },
      };
    case 'ADD_EMAIL_CHIP': {
      if (state.emails.includes(action.payload)) return state;
      return {
        ...state,
        emails: [...state.emails, action.payload],
        fieldErrors: { ...state.fieldErrors, email: undefined },
      };
    }
    case 'REMOVE_EMAIL_CHIP':
      return { ...state, emails: state.emails.filter((e) => e !== action.payload) };
    case 'SET_ROLE':
      return {
        ...state,
        role: action.payload,
        fieldErrors: { ...state.fieldErrors, role: undefined },
      };
    case 'SET_FIELD_ERRORS':
      return { ...state, fieldErrors: action.payload };
    case 'SUBMIT_START':
      return { ...state, status: 'loading', errorMsg: null, warnMsg: null };
    case 'SUBMIT_WARN':
      return { ...state, status: 'warning', warnMsg: action.payload };
    case 'SUBMIT_SUCCESS':
      return { ...state, status: 'success', errorMsg: null, warnMsg: null };
    case 'SUBMIT_ERROR':
      return { ...state, status: 'error', errorMsg: action.payload };
    case 'DISMISS':
      return { ...state, status: 'idle', errorMsg: null, warnMsg: null };
    case 'RESET':
      return initialState();
    default:
      return state;
  }
}

/**
 * Manages the full invite-member form flow including validation, duplicate check, and submission.
 *
 * @param options - Hook options
 * @returns Form state, roles data, and event handlers
 */
export function useInviteMember({
  sdkClient,
  mode,
  initialEmail,
  customMessages = {},
  onSuccess,
}: UseInviteMemberOptions): UseInviteMemberResult {
  const [state, dispatch] = useReducer(reducer, initialState(initialEmail));
  const { t } = useTranslator('member_management.member_management', customMessages);
  const { roles, isLoading: isRolesLoading } = useRolesList(sdkClient);
  const { checkMembership } = useCheckMembership({ sdkClient });

  const handleEmailChange = useCallback((email: string) => {
    dispatch({ type: 'SET_EMAIL', payload: email });
  }, []);

  const handleAddEmailChip = useCallback((email: string) => {
    dispatch({ type: 'ADD_EMAIL_CHIP', payload: email });
  }, []);

  const handleRemoveEmailChip = useCallback((email: string) => {
    dispatch({ type: 'REMOVE_EMAIL_CHIP', payload: email });
  }, []);

  const handleRoleChange = useCallback((role: string) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, []);

  const handleDismiss = useCallback(() => {
    dispatch({ type: 'DISMISS' });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const validate = useCallback((): boolean => {
    const errors: InviteMemberState['fieldErrors'] = {};
    const emailsToCheck = mode === 'multi' ? state.emails : [state.email];
    const hasValidEmail =
      emailsToCheck.length > 0 && emailsToCheck.every((e) => EMAIL_REGEX.test(e));

    if (!hasValidEmail) {
      errors.email = t('form.email.error_invalid');
    }
    if (!state.role) {
      errors.role = t('form.role.error_required');
    }
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_FIELD_ERRORS', payload: errors });
      return false;
    }
    return true;
  }, [mode, state.emails, state.email, state.role, t]);

  const performInvite = useCallback(async () => {
    const emailsToInvite = mode === 'multi' ? state.emails : [state.email];
    dispatch({ type: 'SUBMIT_START' });
    try {
      for (const email of emailsToInvite) {
        const members = await sdkClient.organization.members.list({ q: email });
        const userId = members.members[0]?.user_id;
        if (userId) {
          await sdkClient.organization.members.roles.create(userId, { role_id: state.role });
        }
      }
      dispatch({ type: 'SUBMIT_SUCCESS' });
      onSuccess?.(emailsToInvite, state.role);
    } catch (error: unknown) {
      console.error('[useInviteMember] Invite failed:', error);
      dispatch({ type: 'SUBMIT_ERROR', payload: t('alerts.error_generic') });
    }
  }, [mode, sdkClient, state.emails, state.email, state.role, t, onSuccess]);

  const handleSubmit = useCallback(async () => {
    // If already in warning state (user acknowledged duplicate), proceed
    if (state.status === 'warning') {
      await performInvite();
      return;
    }

    if (!validate()) return;

    const emailToCheck = mode === 'multi' ? state.emails[0] : state.email;
    const isDuplicate = await checkMembership(emailToCheck ?? '');
    if (isDuplicate) {
      dispatch({ type: 'SUBMIT_WARN', payload: t('alerts.duplicate_member') });
      return;
    }

    await performInvite();
  }, [state.status, state.emails, state.email, mode, validate, checkMembership, performInvite, t]);

  return {
    state,
    roles,
    isRolesLoading,
    handleEmailChange,
    handleAddEmailChip,
    handleRemoveEmailChip,
    handleRoleChange,
    handleSubmit,
    handleDismiss,
    handleReset,
  };
}
