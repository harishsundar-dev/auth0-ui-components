/**
 * Member management custom message type definitions.
 * @module member-management-types
 * @internal
 */

/**
 * Custom messages for the invite member dialog form fields.
 * @internal
 */
export interface InviteMemberFormMessages {
  email_label?: string;
  email_placeholder?: string;
  email_helper?: string;
  role_label?: string;
  role_placeholder?: string;
  role_legend?: string;
  role_description?: string;
}

/**
 * Custom messages for the invite member chip input.
 * @internal
 */
export interface InviteMemberChipMessages {
  remove?: string;
  add_hint?: string;
}

/**
 * Custom messages for the invite member action buttons.
 * @internal
 */
export interface InviteMemberButtonMessages {
  send_invite?: string;
  cancel?: string;
  dismiss?: string;
  try_again?: string;
  proceed?: string;
}

/**
 * Custom messages for invite member loading states.
 * @internal
 */
export interface InviteMemberLoadingMessages {
  checking?: string;
  submitting?: string;
}

/**
 * Custom messages for the invite member success state.
 * @internal
 */
export interface InviteMemberSuccessMessages {
  title?: string;
  description?: string;
  description_multiple?: string;
}

/**
 * Custom messages for invite member error states.
 * @internal
 */
export interface InviteMemberErrorMessages {
  invalid_email?: string;
  required_email?: string;
  required_role?: string;
  duplicate_email?: string;
  already_member?: string;
  insufficient_permissions?: string;
  generic?: string;
}

/**
 * Custom messages for invite member warning states.
 * @internal
 */
export interface InviteMemberWarningMessages {
  already_member?: string;
}

/**
 * Custom messages for invite member confirmation step.
 * @internal
 */
export interface InviteMemberConfirmMessages {
  title?: string;
  description?: string;
}

/**
 * Custom messages for the invite member dialog.
 * @internal
 */
export interface InviteMemberMessages {
  dialog?: {
    title?: string;
    description?: string;
  };
  form?: InviteMemberFormMessages;
  chip?: InviteMemberChipMessages;
  buttons?: InviteMemberButtonMessages;
  loading?: InviteMemberLoadingMessages;
  success?: InviteMemberSuccessMessages;
  errors?: InviteMemberErrorMessages;
  warning?: InviteMemberWarningMessages;
  confirm?: InviteMemberConfirmMessages;
}

/**
 * Custom messages for the MemberManagement block.
 * @internal
 */
export interface MemberManagementMessages {
  invite_member?: InviteMemberMessages;
}
