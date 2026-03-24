/**
 * Member management type definitions.
 * @module member-management-types
 */

import type { ComponentStyling } from '@auth0/universal-components-core';

import type { MemberManagementMessages } from '@/types/my-organization/member-management/member-management-messages';

/** Invite status for the member management form state machine. */
export type InviteStatus = 'idle' | 'validating' | 'warning' | 'loading' | 'success' | 'error';

/** Role option returned by the SDK roles list. */
export interface OrganizationRole {
  id: string;
  name: string;
  description?: string;
}

/** Member returned by the SDK members list. */
export interface OrganizationMember {
  user_id: string;
  email?: string;
  name?: string;
}

/** SDK client interface for member management operations. */
export interface MemberManagementSdkClient {
  organization: {
    members: {
      list: (params: { q?: string }) => Promise<{ total: number; members: OrganizationMember[] }>;
      roles: {
        list: () => Promise<OrganizationRole[]>;
        create: (userId: string, params: { role_id: string }) => Promise<void>;
      };
    };
  };
}

/** Design variant for the member management component. */
export type MemberManagementVariant = 'option1' | 'option2';

/** Email input mode. */
export type EmailInputMode = 'single' | 'multi';

/** Role input variant. */
export type RoleInputVariant = 'select' | 'radio';

/** CSS class names for member management component. */
export interface MemberManagementClasses {
  'MemberManagement-dialog'?: string;
  'MemberManagement-form'?: string;
  'MemberManagement-header'?: string;
  'MemberManagement-emailField'?: string;
  'MemberManagement-roleField'?: string;
  'MemberManagement-alertBanner'?: string;
  'MemberManagement-actionBar'?: string;
}

/**
 * Props for the MemberManagement block component.
 */
export interface MemberManagementProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Callback when the dialog should close. */
  onClose: () => void;
  /** Callback invoked on successful invitation. */
  onSuccess?: (emails: string[], role: string) => void;
  /** Injected SDK client for member API calls. */
  sdkClient: MemberManagementSdkClient;
  /** Design variant. Defaults to 'option1'. */
  variant?: MemberManagementVariant;
  /** Email input mode. 'option2' forces 'multi'. Defaults to 'single'. */
  mode?: EmailInputMode;
  /** Role picker variant. Defaults to 'select'. */
  roleInputVariant?: RoleInputVariant;
  /** Pre-filled email address. */
  initialEmail?: string;
  /** Custom i18n message overrides. */
  customMessages?: Partial<MemberManagementMessages>;
  /** CSS variables and class overrides. */
  styling?: ComponentStyling<MemberManagementClasses>;
}

/** Internal form state managed by useReducer. */
export interface InviteMemberState {
  /** Single email value (option1 / single mode). */
  email: string;
  /** Multiple email values (option2 / multi mode). */
  emails: string[];
  /** Selected role id. */
  role: string;
  /** Current async status. */
  status: InviteStatus;
  /** Server-side error message. */
  errorMsg: string | null;
  /** Duplicate-member warning message. */
  warnMsg: string | null;
  /** Per-field validation errors. */
  fieldErrors: { email?: string; role?: string };
}

/** Discriminated union of all state machine actions. */
export type InviteMemberAction =
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'ADD_EMAIL_CHIP'; payload: string }
  | { type: 'REMOVE_EMAIL_CHIP'; payload: string }
  | { type: 'SET_ROLE'; payload: string }
  | { type: 'SET_FIELD_ERRORS'; payload: InviteMemberState['fieldErrors'] }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_WARN'; payload: string }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'DISMISS' }
  | { type: 'RESET' };

/** Return type for the useInviteMember hook. */
export interface UseInviteMemberResult {
  state: InviteMemberState;
  roles: OrganizationRole[];
  isRolesLoading: boolean;
  handleEmailChange: (email: string) => void;
  handleAddEmailChip: (email: string) => void;
  handleRemoveEmailChip: (email: string) => void;
  handleRoleChange: (role: string) => void;
  handleSubmit: () => Promise<void>;
  handleDismiss: () => void;
  handleReset: () => void;
}

/** Options for the useInviteMember hook. */
export interface UseInviteMemberOptions {
  sdkClient: MemberManagementSdkClient;
  mode: EmailInputMode;
  initialEmail?: string;
  customMessages?: Partial<MemberManagementMessages>;
  onSuccess?: (emails: string[], role: string) => void;
}

/** Return type for the useRolesList hook. */
export interface UseRolesListResult {
  roles: OrganizationRole[];
  isLoading: boolean;
}

/** Options for the useCheckMembership hook. */
export interface UseCheckMembershipOptions {
  sdkClient: MemberManagementSdkClient;
}

/** Return type for the useCheckMembership hook. */
export interface UseCheckMembershipResult {
  checkMembership: (email: string) => Promise<boolean>;
}
