import type {
  MemberInvitation,
  MemberRole,
  OrganizationMember,
} from '../../../../types/my-organization/members-management';

export const createMockMemberRole = (overrides?: Partial<MemberRole>): MemberRole => ({
  id: 'rol_mock123',
  name: 'Admin',
  description: 'Administrator role',
  ...overrides,
});

export const createMockOrganizationMember = (
  overrides?: Partial<OrganizationMember>,
): OrganizationMember => ({
  userId: 'auth0|user123',
  email: 'member@example.com',
  name: 'Test Member',
  picture: undefined,
  roles: [createMockMemberRole()],
  lastLogin: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockMemberInvitation = (
  overrides?: Partial<MemberInvitation>,
): MemberInvitation => ({
  id: 'uinv_mock123',
  inviteeEmail: 'invited@example.com',
  roles: [createMockMemberRole()],
  invitedBy: 'admin@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
  status: 'pending',
  ...overrides,
});
