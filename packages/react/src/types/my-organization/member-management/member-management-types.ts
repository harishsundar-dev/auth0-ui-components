/**
 * Member management type definitions.
 * @module member-management-types
 */

import type {
  BlockComponentSharedProps,
  ComponentStyling,
  MemberManagementMessages,
} from '@auth0/universal-components-core';

/**
 * Dialog state values for the invite member flow.
 * @internal
 */
export type InviteMemberDialogState =
  | 'idle'
  | 'validating'
  | 'checking_membership'
  | 'submitting'
  | 'success'
  | 'error'
  | 'warning';

/**
 * Layout variant for the invite member dialog.
 * - `option1`: Single email input with role selector
 * - `option2`: Multi-email chip input with role selector
 */
export type InviteMemberVariant = 'option1' | 'option2';

/**
 * Role input style variant.
 * - `select`: Dropdown combobox selector
 * - `radio`: Radio button group
 */
export type RoleInputVariant = 'select' | 'radio';

/**
 * Represents an available role for assignment.
 */
export interface MemberRole {
  id: string;
  name: string;
  description?: string;
}

/**
 * CSS class overrides for MemberManagement component.
 */
export interface MemberManagementClasses {
  'MemberManagement-dialog'?: string;
  'MemberManagement-form'?: string;
  'MemberManagement-emailInput'?: string;
  'MemberManagement-chipList'?: string;
  'MemberManagement-roleSelect'?: string;
  'MemberManagement-roleRadioGroup'?: string;
  'MemberManagement-alertBanner'?: string;
  'MemberManagement-successView'?: string;
}

/**
 * Props for the MemberManagement block component.
 */
export interface MemberManagementProps
  extends BlockComponentSharedProps<MemberManagementMessages, MemberManagementClasses> {
  /** Whether the dialog is open. */
  open: boolean;
  /** Callback to change the open state. */
  onOpenChange: (open: boolean) => void;
  /** Available roles to assign to invited members. */
  availableRoles?: MemberRole[];
  /** Callback invoked after a successful invite. */
  onSuccess?: (invitedEmails: string[]) => void;
  /** Callback to perform the invite action. Returns a promise that resolves on success or rejects on failure. */
  onInvite: (emails: string[], roleId: string) => Promise<void>;
  /** Optional callback to check if an email is already a member. Returns true if already a member. */
  onCheckMembership?: (email: string) => Promise<boolean>;
  /** Layout variant: single email (option1) or multi-email chip input (option2). Defaults to 'option1'. */
  variant?: InviteMemberVariant;
  /** Role input style: dropdown select or radio group. Defaults to 'select'. */
  roleInputVariant?: RoleInputVariant;
}

/**
 * Props for the MemberManagementView component.
 * @internal
 */
export interface MemberManagementViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableRoles: MemberRole[];
  variant: InviteMemberVariant;
  roleInputVariant: RoleInputVariant;
  styling: ComponentStyling<MemberManagementClasses>;
  customMessages: MemberManagementProps['customMessages'];
  dialogState: InviteMemberDialogState;
  emails: string[];
  role: string;
  errors: InviteMemberErrors;
  onAddEmail: (email: string) => void;
  onRemoveEmail: (email: string) => void;
  onSetRole: (role: string) => void;
  onSubmit: () => Promise<void>;
  onDismiss: () => void;
  onReset: () => void;
  onProceedDespiteWarning: () => Promise<void>;
}

/**
 * Validation/error state for the invite member form.
 * @internal
 */
export interface InviteMemberErrors {
  email?: string;
  role?: string;
  submission?: string;
}

/**
 * Options for the useMemberManagement hook.
 * @internal
 */
export interface UseMemberManagementOptions {
  onInvite: MemberManagementProps['onInvite'];
  onCheckMembership?: MemberManagementProps['onCheckMembership'];
  onSuccess?: MemberManagementProps['onSuccess'];
  customMessages?: Partial<MemberManagementMessages>;
  variant?: InviteMemberVariant;
}

/**
 * Return value of the useMemberManagement hook.
 * @internal
 */
export interface UseMemberManagementResult {
  dialogState: InviteMemberDialogState;
  emails: string[];
  role: string;
  errors: InviteMemberErrors;
  isLoading: boolean;
  warningEmails: string[];
  addEmail: (email: string) => void;
  removeEmail: (email: string) => void;
  setRole: (role: string) => void;
  submit: () => Promise<void>;
  dismiss: () => void;
  reset: () => void;
  proceedDespiteWarning: () => Promise<void>;
}
