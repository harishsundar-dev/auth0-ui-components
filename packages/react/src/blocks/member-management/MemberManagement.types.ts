export interface OrganizationMember {
  user_id: string;
  name?: string;
  email?: string;
  picture?: string;
  last_login?: string;
  roles?: OrganizationRole[];
}

export interface OrganizationRole {
  id: string;
  name: string;
  description?: string;
}

export interface OrganizationInvitation {
  id: string;
  invitee: { email: string };
  inviter: { name: string };
  roles?: OrganizationRole[];
  ticket_expiration_at?: string;
  created_at: string;
  status?: 'pending' | 'expired' | 'accepted';
  invitation_url?: string;
}

export interface MembersListResponse {
  members: OrganizationMember[];
  next?: string;
  total?: number;
}

export interface InvitationsListResponse {
  invitations: OrganizationInvitation[];
  next?: string;
  total?: number;
}

export interface OrganizationSDKClient {
  organization: {
    members: {
      list(params: { q?: string; from?: string; take?: number }): Promise<MembersListResponse>;
      get(userId: string): Promise<OrganizationMember>;
      deleteMembers(params: { members: string[] }): Promise<void>;
      roles: {
        list(userId: string): Promise<OrganizationRole[]>;
        create(userId: string, params: { roles: string[] }): Promise<void>;
        delete(userId: string, roleId: string): Promise<void>;
      };
    };
    memberships: {
      deleteMemberships(params: { members: string[] }): Promise<void>;
    };
    invitations: {
      list(params: {
        from?: string;
        take?: number;
        role?: string;
      }): Promise<InvitationsListResponse>;
      create(params: {
        invitee: { email: string };
        roles?: string[];
        connection_id?: string;
      }): Promise<OrganizationInvitation>;
      delete(invitationId: string): Promise<void>;
    };
    roles: {
      list(): Promise<OrganizationRole[]>;
    };
  };
}

export type ActiveTab = 'members' | 'invitations';

export type ConfirmationDialogType =
  | 'revoke'
  | 'revoke-resend'
  | 'delete-member'
  | 'delete-members-bulk'
  | 'remove-member'
  | 'remove-members-bulk'
  | 'remove-role'
  | 'remove-roles-bulk';

export interface ConfirmationDialogState {
  type: ConfirmationDialogType;
  payload: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
  duration: number;
}

export interface MemberManagementContextValue {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedMemberIds: string[];
  setSelectedMemberIds: (ids: string[]) => void;
  orgName: string;
  orgId: string;
  client: OrganizationSDKClient;
  toastQueue: Toast[];
  pushToast: (message: string, type: 'success' | 'error') => void;
  dismissToast: (id: string) => void;
  confirmationDialog: ConfirmationDialogState | null;
  setConfirmationDialog: (state: ConfirmationDialogState | null) => void;
  detailUserId: string | null;
  setDetailUserId: (userId: string | null) => void;
}

export interface MemberManagementProps {
  client: OrganizationSDKClient;
  orgId: string;
  orgName: string;
  defaultTab?: ActiveTab;
  onMemberDeleted?: (userId: string) => void;
  onMemberRemoved?: (userId: string) => void;
  onInvitationRevoked?: (invitationId: string) => void;
  className?: string;
}
