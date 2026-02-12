export interface MemberManagementMessages {
  members?: {
    title?: string;
    description?: string;
    tabs?: {
      members?: string;
      invitations?: string;
    };
    invite_button?: string;
    back_button?: string;
    filter_by_role?: string;
    filter_by_role_selected?: string;
    reset_filter?: string;
    search_placeholder?: string;
    table?: {
      email?: string;
      name?: string;
      status?: string;
      roles?: string;
      created_at?: string;
      last_login?: string;
      expires_at?: string;
      invited_by?: string;
      actions?: string;
      select_all?: string;
      select_row?: string;
    };
    status?: {
      active?: string;
      pending?: string;
      expired?: string;
    };
    empty_state?: {
      title?: string;
      description?: string;
    };
    no_results?: {
      title?: string;
      description?: string;
    };
    bulk_actions?: {
      selected?: string;
      delete?: string;
      remove?: string;
    };
    row_actions?: {
      view_details?: string;
      assign_roles?: string;
      remove?: string;
      delete?: string;
    };
  };
  invitations?: {
    empty_state?: {
      title?: string;
      description?: string;
    };
    row_actions?: {
      resend?: string;
      revoke?: string;
    };
  };
  invite_member?: {
    title?: string;
    description?: string;
    email_label?: string;
    email_placeholder?: string;
    email_hint?: string;
    roles_label?: string;
    roles_placeholder?: string;
    roles_hint?: string;
    cancel?: string;
    submit?: string;
    submitting?: string;
    success?: string;
    success_multiple?: string;
    error?: string;
  };
  member_details?: {
    back?: string;
    title?: string;
    email_label?: string;
    name_label?: string;
    created_label?: string;
    last_login_label?: string;
    never_logged_in?: string;
    assign_roles?: string;
    roles_label?: string;
    no_roles?: string;
    remove_role?: string;
  };
  role_selector?: {
    title?: string;
    description?: string;
    search_placeholder?: string;
    no_roles?: string;
    cancel?: string;
    confirm?: string;
    saving?: string;
  };
  delete_member?: {
    title?: string;
    title_plural?: string;
    description_single?: string;
    description_multiple?: string;
    cancel?: string;
    confirm?: string;
    deleting?: string;
    success?: string;
    success_multiple?: string;
    error?: string;
  };
  remove_member?: {
    title?: string;
    title_plural?: string;
    description_single?: string;
    description_multiple?: string;
    cancel?: string;
    confirm?: string;
    removing?: string;
    success?: string;
    success_multiple?: string;
    error?: string;
  };
  roles?: {
    admin?: string;
    admin_description?: string;
    member?: string;
    member_description?: string;
    viewer?: string;
    viewer_description?: string;
  };
  errors?: {
    load_members?: string;
    load_invitations?: string;
    load_roles?: string;
    retry?: string;
  };
}
