import { z } from 'zod';

import { type InvitationCreateSchemas } from './invitation-schema-types';

/**
 * Creates a schema for invitation create form validation
 * @param _options - Schema configuration options (reserved for future use)
 */
export const createInvitationCreateSchema = (_options?: InvitationCreateSchemas) => {
  return z.object({
    email_list: z.string().min(1, 'Email is required'),
    roles: z.array(z.string()),
  });
};

/**
 * Default schema for invitation create form validation
 */
export const invitationCreateSchema = createInvitationCreateSchema();

/**
 * Type for invitation create form data
 */
export type InternalInvitationCreateFormValues = z.infer<typeof invitationCreateSchema>;

/**
 * Helper function to parse and validate email list
 */
export function parseEmailList(emailListString: string, maxEmails = 10): string[] {
  const emails = emailListString
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (emails.length > maxEmails) {
    throw new Error(`Maximum ${maxEmails} email addresses allowed`);
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const invalidEmails = emails.filter((email) => !emailRegex.test(email));

  if (invalidEmails.length > 0) {
    throw new Error('One or more email addresses are invalid');
  }

  return emails;
}
