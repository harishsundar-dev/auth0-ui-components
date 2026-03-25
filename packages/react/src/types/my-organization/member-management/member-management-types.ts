/**
 * Member management types.
 * @module member-management-types
 */

import type { ComponentStyling } from '@auth0/universal-components-core';
import type React from 'react';

// ---------------------------------------------------------------------------
// SDK type aliases – these mirror the shapes from @auth0/myorganization-js
// and are defined locally because the react package does not depend on the
// SDK directly.
// ---------------------------------------------------------------------------

/** Organization member role. */
export interface OrgMemberRole {
  id: string;
  name: string;
  description?: string;
}

/** Organization member. */
export interface OrgMember {
  user_id?: string;
  email?: string;
  name?: string;
  nickname?: string;
  given_name?: string;
  family_name?: string;
  roles?: OrgMemberRole[];
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

/** Member invitation. */
export interface MemberInvitation {
  id?: string;
  organization_id?: string;
  inviter?: { name?: string };
  invitee?: { email?: string };
  identity_provider_id?: string;
  created_at?: string;
  expires_at?: string;
  roles?: string[];
  invitation_url?: string;
  ticket_id?: string;
}

// ---------------------------------------------------------------------------
// Tab types
// ---------------------------------------------------------------------------

/** Active tab within the member management block. */
export type MemberManagementTab = 'members' | 'invitations';

/** Active tab within the member detail view. */
export type MemberDetailTab = 'details' | 'roles';

// ---------------------------------------------------------------------------
// Confirmation modal discriminated union
// ---------------------------------------------------------------------------

export type ConfirmModalState =
  | { type: 'revokeResend'; invitationId: string; email: string }
  | { type: 'revokeInvitation'; invitationId: string; email: string }
  | { type: 'deleteSingleMember'; userId: string; displayName: string }
  | { type: 'bulkDeleteMembers'; userIds: string[] }
  | { type: 'removeSingleMember'; userId: string; displayName: string; orgName: string }
  | { type: 'bulkRemoveMembers'; userIds: string[]; orgName: string }
  | {
      type: 'removeSingleRole';
      userId: string;
      roleId: string;
      roleName: string;
      memberName: string;
    }
  | {
      type: 'bulkRemoveRoles';
      userId: string;
      roleIds: string[];
      roleNames: string[];
      memberName: string;
    };

// ---------------------------------------------------------------------------
// Toast state
// ---------------------------------------------------------------------------

export interface ToastState {
  message: string;
  variant: 'success' | 'error' | 'info';
}

// ---------------------------------------------------------------------------
// CSS class overrides
// ---------------------------------------------------------------------------

export interface MemberManagementClasses {
  'MemberManagement-root': string;
  'MemberManagement-tabs': string;
  'MemberManagement-header': string;
  'MemberManagement-table': string;
  'MemberManagement-detail': string;
}

// ---------------------------------------------------------------------------
// Custom i18n message types
// ---------------------------------------------------------------------------

export interface MemberManagementMessages {
  header?: {
    title?: string;
    description?: string;
  };
  tabs?: {
    members?: string;
    invitations?: string;
  };
  members_table?: {
    columns?: {
      name?: string;
      roles?: string;
      last_login?: string;
    };
    search_placeholder?: string;
    empty_message?: string;
    filter_by_role?: string;
    filter_all?: string;
    bulk_selected?: string;
    invite_button?: string;
    actions?: {
      view_details?: string;
      assign_role?: string;
      remove_from_organization?: string;
      delete?: string;
    };
  };
  invitations_table?: {
    columns?: {
      email?: string;
      status?: string;
      created_at?: string;
      expires_at?: string;
      invited_by?: string;
    };
    empty_message?: string;
    status?: {
      pending?: string;
      expired?: string;
    };
    actions?: {
      view_details?: string;
      copy_invitation_url?: string;
      copied?: string;
      revoke_and_resend?: string;
      revoke_invitation?: string;
    };
  };
  member_detail?: {
    back_button?: string;
    tabs?: {
      details?: string;
      roles?: string;
    };
    details?: {
      name?: string;
      email?: string;
      phone?: string;
      provider?: string;
      created_at?: string;
      last_login?: string;
      status?: string;
      status_active?: string;
      status_inactive?: string;
      not_available?: string;
    };
    roles?: {
      title?: string;
      assign_roles?: string;
      remove_roles?: string;
      empty_message?: string;
    };
    danger_zone?: {
      title?: string;
      remove_member?: string;
      remove_member_description?: string;
    };
  };
  invite_member?: {
    title?: string;
    description?: string;
    email_label?: string;
    email_placeholder?: string;
    role_label?: string;
    submit?: string;
    cancel?: string;
    invalid_email?: string;
  };
  confirmation?: {
    revoke_resend?: {
      title?: string;
      description?: string;
      confirm?: string;
      cancel?: string;
    };
    revoke_invitation?: {
      title?: string;
      description?: string;
      confirm?: string;
      cancel?: string;
    };
    delete_member?: {
      title?: string;
      description?: string;
      confirm?: string;
      cancel?: string;
    };
    bulk_delete?: {
      title?: string;
      description?: string;
      confirm?: string;
      cancel?: string;
    };
    remove_member?: {
      title?: string;
      description?: string;
      confirm?: string;
      cancel?: string;
    };
    bulk_remove?: {
      title?: string;
      description?: string;
      confirm?: string;
      cancel?: string;
    };
    remove_role?: {
      title?: string;
      description?: string;
      confirm?: string;
      cancel?: string;
    };
    bulk_remove_roles?: {
      title?: string;
      description?: string;
      confirm?: string;
      cancel?: string;
    };
    assign_roles?: {
      title?: string;
      description?: string;
      confirm?: string;
      cancel?: string;
    };
  };
  toasts?: {
    invite_success?: string;
    revoke_resend_success?: string;
    revoke_success?: string;
    delete_success?: string;
    bulk_delete_success?: string;
    remove_success?: string;
    bulk_remove_success?: string;
    role_assigned_success?: string;
    role_removed_success?: string;
    bulk_roles_removed_success?: string;
    error_generic?: string;
  };
  pagination?: {
    previous?: string;
    next?: string;
    rows_per_page?: string;
  };
}

// ---------------------------------------------------------------------------
// Block component props
// ---------------------------------------------------------------------------

/** Props for the MemberManagement block component. */
export interface MemberManagementProps {
  customMessages?: Partial<MemberManagementMessages>;
  styling?: ComponentStyling<MemberManagementClasses>;
  readOnly?: boolean;
  onNavigateToMember?: (userId: string) => void;
  perPageOptions?: number[];
}

/** Props for the MemberManagement view component. */
export interface MemberManagementViewProps {
  customMessages: Partial<MemberManagementMessages>;
  styling: ComponentStyling<MemberManagementClasses>;
  readOnly: boolean;
  onNavigateToMember?: (userId: string) => void;
  perPageOptions: number[];
}

// ---------------------------------------------------------------------------
// Hook return types
// ---------------------------------------------------------------------------

/** Return type for the useMemberManagement hook. */
export interface UseMemberManagementReturn {
  activeTab: MemberManagementTab;
  setActiveTab: (tab: MemberManagementTab) => void;
  selectedMemberIds: string[];
  setSelectedMemberIds: React.Dispatch<React.SetStateAction<string[]>>;
  confirmModal: ConfirmModalState | null;
  setConfirmModal: (modal: ConfirmModalState | null) => void;
  activeMemberId: string | null;
  setActiveMemberId: (id: string | null) => void;
}

/** Return type for the useMembersList hook. */
export interface UseMembersListReturn {
  members: OrgMember[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  refetch: () => void;
}

/** Return type for the useInvitationsList hook. */
export interface UseInvitationsListReturn {
  invitations: MemberInvitation[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  refetch: () => void;
}

/** Return type for the useMemberDetail hook. */
export interface UseMemberDetailReturn {
  member: OrgMember | null;
  roles: OrgMemberRole[];
  isLoading: boolean;
  error: Error | null;
  assignRole: (roleId: string) => Promise<void>;
  removeRole: (roleId: string) => Promise<void>;
  refetchRoles: () => void;
}
