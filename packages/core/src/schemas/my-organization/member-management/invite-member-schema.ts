import { z } from 'zod';

/**
 * Schema for validating email addresses
 */
export const emailSchema = z.string().min(1, 'Email is required').email('Invalid email address');

/**
 * Schema for organization role
 */
export const organizationRoleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
});

/**
 * Schema for single invite form data
 */
export const singleInviteFormSchema = z.object({
  email: emailSchema,
  roles: z.array(z.string()).min(0),
});

/**
 * Schema for bulk invite form data
 * Validates comma or newline separated emails
 */
export const bulkInviteFormSchema = z.object({
  emails: z
    .string()
    .min(1, 'At least one email is required')
    .refine(
      (value) => {
        const emails = value
          .split(/[,\n]/)
          .map((e) => e.trim())
          .filter(Boolean);
        return emails.length > 0;
      },
      { message: 'At least one valid email is required' },
    )
    .refine(
      (value) => {
        const emails = value
          .split(/[,\n]/)
          .map((e) => e.trim())
          .filter(Boolean);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emails.every((email) => emailRegex.test(email));
      },
      { message: 'One or more email addresses are invalid' },
    ),
  roles: z.array(z.string()).min(0),
});

/**
 * Schema for invitation response from API
 */
export const invitationSchema = z.object({
  id: z.string(),
  inviter: z
    .object({
      name: z.string().optional(),
    })
    .optional(),
  invitee: z.object({
    email: z.string().email(),
  }),
  invitation_url: z.string().optional(),
  ticket_id: z.string().optional(),
  created_at: z.string(),
  expires_at: z.string(),
  organization_id: z.string().optional(),
  client_id: z.string().optional(),
  connection_id: z.string().optional(),
  app_metadata: z.record(z.unknown()).optional(),
  user_metadata: z.record(z.unknown()).optional(),
  roles: z.array(z.string()).optional(),
  send_invitation_email: z.boolean().optional(),
});

/**
 * Schema for create invitation request
 */
export const createInvitationRequestSchema = z.object({
  inviter: z
    .object({
      name: z.string().optional(),
    })
    .optional(),
  invitee: z.object({
    email: emailSchema,
  }),
  client_id: z.string().optional(),
  connection_id: z.string().optional(),
  app_metadata: z.record(z.unknown()).optional(),
  user_metadata: z.record(z.unknown()).optional(),
  roles: z.array(z.string()).optional(),
  send_invitation_email: z.boolean().optional(),
  ttl_sec: z.number().optional(),
});

/**
 * Type exports from schemas
 */
export type SingleInviteFormData = z.infer<typeof singleInviteFormSchema>;
export type BulkInviteFormData = z.infer<typeof bulkInviteFormSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type OrganizationRole = z.infer<typeof organizationRoleSchema>;
export type CreateInvitationRequest = z.infer<typeof createInvitationRequestSchema>;
