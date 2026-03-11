import { z } from 'zod';

export const memberRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export const organizationMemberSchema = z.object({
  user_id: z.string(),
  email: z.string().optional(),
  name: z.string().optional(),
  picture: z.string().optional(),
  roles: z.array(memberRoleSchema).optional().default([]),
  last_login: z.string().optional(),
  created_at: z.string().optional(),
});

export const membersListResponseSchema = z.object({
  members: z.array(organizationMemberSchema),
  total: z.number().int().nonnegative(),
  next: z.string().optional(),
});

export const membersListRequestSchema = z.object({
  page: z.number().int().positive().default(1),
  per_page: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  role_id: z.string().optional(),
});

export type MemberRoleSchema = z.infer<typeof memberRoleSchema>;
export type OrganizationMemberSchema = z.infer<typeof organizationMemberSchema>;
export type MembersListResponse = z.infer<typeof membersListResponseSchema>;
export type MembersListRequest = z.infer<typeof membersListRequestSchema>;
