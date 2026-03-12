export interface OrganizationMembersManagerMessages {
  header?: {
    title?: string;
    invite_button_text?: string;
  };
  tabs?: {
    members?: string;
    invitations?: string;
  };
  notifications?: {
    invite_success?: string;
    invite_error?: string;
    remove_success?: string;
    remove_error?: string;
    delete_invitation_success?: string;
    delete_invitation_error?: string;
    update_roles_success?: string;
    update_roles_error?: string;
  };
}
