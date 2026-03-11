import type {
  MemberRole,
  MembersListProps,
  OrganizationMember,
} from '../../../../types/my-organization/members/members-list-types';

export const createMockMemberRole = (overrides: Partial<MemberRole> = {}): MemberRole => ({
  id: 'role_abc123',
  name: 'Admin',
  description: 'Administrator role',
  ...overrides,
});

export const createMockOrganizationMember = (
  overrides: Partial<OrganizationMember> = {},
): OrganizationMember => ({
  user_id: 'user_abc123',
  email: 'member@example.com',
  name: 'John Doe',
  picture: undefined,
  roles: [createMockMemberRole()],
  last_login: new Date(Date.now() - 3600000).toISOString(),
  created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  ...overrides,
});

export const createMockMembersListProps = (
  overrides: Partial<MembersListProps> = {},
): MembersListProps => ({
  customMessages: {},
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  readOnly: false,
  ...overrides,
});

export const createMockMembersApiResponse = (
  members: OrganizationMember[] = [createMockOrganizationMember()],
  total?: number,
) => ({
  members,
  total: total ?? members.length,
});

export const createMockRolesApiResponse = (roles: MemberRole[] = [createMockMemberRole()]) => ({
  roles,
});
