/**
 * Custom message type definitions for member management component.
 * @module member-management-messages
 * @internal
 */
export interface MemberManagementMessages {
  dialog?: {
    title?: string;
    description?: string;
    close_button_label?: string;
  };
  form?: {
    email?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error_invalid?: string;
      error_required?: string;
    };
    role?: {
      label?: string;
      placeholder?: string;
      error_required?: string;
    };
  };
  buttons?: {
    cancel?: string;
    send_invite?: string;
    sending?: string;
    send_anyway?: string;
  };
  alerts?: {
    duplicate_member?: string;
    success?: string;
    error_generic?: string;
  };
}
