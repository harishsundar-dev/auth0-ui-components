import type { MyOrganization } from '@auth0/myorganization-js';

/**
 * Member data structure from the API
 */
export interface Member {
  user_id: string;
  email: string;
  name?: string;
  picture?: string;
  created_at: string;
  last_login?: string;
}

/**
 * Invitation data structure from the API
 */
export interface Invitation {
  id: string;
  invitee: {
    email: string;
  };
  inviter: {
    name?: string;
    email?: string;
  };
  roles?: string[];
  created_at: string;
  expires_at: string;
  ticket_id?: string;
  organization_id: string;
}

/**
 * Role data structure
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
}

/**
 * Invitation status derived from dates
 */
export type InvitationStatus = 'pending' | 'expired';

// API response types from the SDK
export type OrgMember = MyOrganization.OrgMember;
export type MemberInvitation = MyOrganization.MemberInvitation;
export type OrgMemberRole = MyOrganization.OrgMemberRole;
export type GetMemberResponse = MyOrganization.GetOrganizationMemberResponseContent;
export type CreateInvitationResponse = MyOrganization.CreateMemberInvitationResponseContent;
export type GetInvitationResponse = MyOrganization.GetMemberInvitationResponseContent;
