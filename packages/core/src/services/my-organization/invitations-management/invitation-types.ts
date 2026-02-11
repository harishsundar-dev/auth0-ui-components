import type { InternalInvitationCreateFormValues } from '@core/schemas';

// Invitation types from SDK
export type InvitationStatus = 'pending' | 'expired';

export interface Invitation {
  id: string;
  invitee: {
    email: string;
  };
  inviter: {
    name: string;
  };
  organization_id: string;
  roles: string[];
  created_at: string;
  expires_at: string;
  ticket_id?: string;
  invitation_url?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export type CreateInvitationRequestContentPrivate = InternalInvitationCreateFormValues;

// Messages
export interface InvitationsTableMessages {
  header?: {
    title?: string;
    description?: string;
    create_button_text?: string;
    back_button_text?: string;
  };
  tabs?: {
    members?: string;
    invitations?: string;
  };
  filter?: {
    role_label?: string;
    role_all?: string;
    reset?: string;
  };
  table?: {
    empty_message?: string;
    columns?: {
      email?: string;
      status?: string;
      created_at?: string;
      expires_at?: string;
      invited_by?: string;
      roles?: string;
    };
    actions?: {
      resend_button_text?: string;
      delete_button_text?: string;
    };
  };
}

export interface InvitationCreateMessages {
  modal?: {
    title?: string;
    description?: string;
    field?: {
      email_label?: string;
      email_placeholder?: string;
      email_hint?: string;
      email_error?: string;
      roles_label?: string;
      roles_placeholder?: string;
      roles_hint?: string;
    };
    actions?: {
      cancel_button_text?: string;
      send_button_text?: string;
      sending_button_text?: string;
    };
  };
}

export interface InvitationDeleteMessages {
  modal?: {
    title?: string;
    description?: string;
    email_label?: string;
    actions?: {
      cancel_button_text?: string;
      delete_button_text?: string;
      deleting_button_text?: string;
    };
  };
}
