import type { MyOrganization } from '@auth0/myorganization-js';

export type OrgMember = MyOrganization.OrgMember;
export type OrgMemberRole = MyOrganization.OrgMemberRole;

export interface MemberRole {
  id: string;
  name: string;
  description?: string;
}

export interface OrganizationMember {
  user_id: string;
  email?: string;
  name?: string;
  picture?: string;
  roles: MemberRole[];
  last_login?: string;
  created_at?: string;
}

export interface MembersListApiRequest {
  page?: number;
  per_page?: number;
  search?: string;
  role_id?: string;
}

export interface MembersListApiResponse {
  members: OrganizationMember[];
  total: number;
  next?: string;
}

export interface RolesListApiResponse {
  roles: MemberRole[];
}
