import { z } from 'zod';

/**
 * Schema for a single email address
 */
export const emailSchema = z.string().min(1, 'Email is required').email('Invalid email address');

/**
 * Schema for bulk email input (comma-separated)
 */
export const bulkEmailsSchema = z
  .string()
  .min(1, 'At least one email is required')
  .refine(
    (value) => {
      const emails = value
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      return emails.length > 0 && emails.length <= 10;
    },
    { message: 'Enter between 1 and 10 email addresses' },
  )
  .refine(
    (value) => {
      const emails = value
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emails.every((email) => emailRegex.test(email));
    },
    { message: 'One or more email addresses are invalid' },
  );

/**
 * Schema for role selection
 */
export const rolesSchema = z.array(z.string()).optional().default([]);

/**
 * Schema for role filter
 */
export const roleFilterSchema = z.string().nullable().optional();

/**
 * Schema for invite member form
 */
export const inviteMemberSchema = z.object({
  emails: bulkEmailsSchema,
  roles: rolesSchema,
});

/**
 * Schema for member search/filter
 */
export const memberFilterSchema = z.object({
  search: z.string().optional(),
  roleFilter: roleFilterSchema,
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(10),
});

/**
 * Schema for member response from API
 */
export const memberResponseSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  created_at: z.string().datetime(),
  last_login: z.string().datetime().optional(),
});

/**
 * Schema for invitation response from API
 */
export const invitationResponseSchema = z.object({
  id: z.string(),
  invitee: z.object({
    email: z.string().email(),
  }),
  inviter: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  }),
  roles: z.array(z.string()).optional(),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  ticket_id: z.string().optional(),
  organization_id: z.string(),
});

/**
 * Schema for role response from API
 */
export const roleResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type MemberFilterInput = z.infer<typeof memberFilterSchema>;
export type MemberResponse = z.infer<typeof memberResponseSchema>;
export type InvitationResponse = z.infer<typeof invitationResponseSchema>;
export type RoleResponse = z.infer<typeof roleResponseSchema>;
