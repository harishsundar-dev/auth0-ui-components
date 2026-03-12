import type { SharedComponentProps } from '@auth0/universal-components-core';
import type { OrganizationMembersManagerMessages } from '@auth0/universal-components-core';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface MemberRole {
  id: string;
  name: string;
  description?: string;
}

export interface OrganizationMember {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  roles: MemberRole[];
  lastLogin?: string;
  createdAt: string;
}

export interface MemberInvitation {
  id: string;
  inviteeEmail: string;
  roles: MemberRole[];
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: InvitationStatus;
}

export interface SingleInviteFormValues {
  email: string;
  roleIds: string[];
}

export interface BulkInviteFormValues {
  emails: string;
  roleIds: string[];
}

export interface OrganizationMembersManagerProps
  extends Pick<
    SharedComponentProps<OrganizationMembersManagerMessages, Record<string, string>, object>,
    'customMessages' | 'readOnly'
  > {
  onBack?: () => void;
  initialTab?: 'members' | 'invitations';
  onMemberInvited?: (invitation: MemberInvitation) => void;
  onMemberRemoved?: (userId: string) => void;
  className?: string;
}

export interface UseOrganizationMembersOptions {
  customMessages?: OrganizationMembersManagerProps['customMessages'];
}

export interface UseOrganizationInvitationsOptions {
  customMessages?: OrganizationMembersManagerProps['customMessages'];
}

export interface UseOrganizationRolesOptions {
  enabled?: boolean;
}

export interface UseInviteMemberOptions {
  onSuccess?: (invitation: MemberInvitation) => void;
  customMessages?: OrganizationMembersManagerProps['customMessages'];
}
