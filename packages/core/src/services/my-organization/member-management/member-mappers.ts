import type {
  Invitation,
  InvitationStatus,
  MemberInvitation,
  OrgMember,
  OrgMemberRole,
  Member,
  Role,
} from './member-types';

/**
 * Mappers to transform between API responses and application data structures
 */
export const MemberManagementMappers = {
  /**
   * Maps API member response to Member interface
   */
  fromMemberAPI(apiMember: OrgMember): Member {
    return {
      user_id: apiMember.user_id || '',
      email: apiMember.email || '',
      name: apiMember.name,
      picture: undefined, // picture not available in OrgMember type
      created_at: apiMember.created_at || '',
      last_login: apiMember.last_login,
    };
  },

  /**
   * Maps API invitation response to Invitation interface
   */
  fromInvitationAPI(apiInvitation: MemberInvitation): Invitation {
    return {
      id: apiInvitation.id,
      invitee: {
        email: apiInvitation.invitee.email || '',
      },
      inviter: {
        name: apiInvitation.inviter?.name,
        email: undefined, // email not available in MemberInvitationInviter type
      },
      roles: apiInvitation.roles,
      created_at: apiInvitation.created_at,
      expires_at: apiInvitation.expires_at,
      ticket_id: apiInvitation.ticket_id,
      organization_id: apiInvitation.organization_id,
    };
  },

  /**
   * Maps API role response to Role interface
   */
  fromRoleAPI(apiRole: OrgMemberRole): Role {
    return {
      id: apiRole.id,
      name: apiRole.name,
      description: apiRole.description,
    };
  },

  /**
   * Maps API member roles response to Role array
   */
  fromMemberRolesAPI(apiRoles: OrgMemberRole[]): Role[] {
    return apiRoles.map((role: OrgMemberRole) => ({
      id: role.id,
      name: role.name,
      description: role.description,
    }));
  },

  /**
   * Determines invitation status based on expiration date
   */
  getInvitationStatus(expiresAt: string): InvitationStatus {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    return expirationDate > now ? 'pending' : 'expired';
  },

  /**
   * Splits comma-separated emails into an array
   */
  parseEmails(emailsString: string): string[] {
    return emailsString
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);
  },
};
