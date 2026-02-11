import { z } from 'zod';

import { type InvitationCreateSchemas } from './invitation-schema-types';

/**
 * Helper to merge schema field config with defaults
 */
const mergeFieldConfig = <T extends keyof InvitationCreateSchemas>(
  schema: InvitationCreateSchemas | undefined,
  field: T,
  defaultConfig: Record<string, unknown>,
) => {
  const fieldConfig = schema?.[field];
  return fieldConfig ? { ...defaultConfig, ...fieldConfig } : defaultConfig;
};

/**
 * Creates email validation schema
 * Supports comma-separated email lists
 */
const createEmailListSchema = (options: InvitationCreateSchemas = {}) => {
  const config = mergeFieldConfig(options, 'emailList', {
    maxEmails: 10,
    errorMessage: 'Please enter valid email address(es)',
  });

  const emailRegex =
    config.regex instanceof RegExp
      ? config.regex
      : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return z
    .string()
    .min(1, 'Email is required')
    .transform((val) =>
      val
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean),
    )
    .refine((emails) => emails.length <= config.maxEmails, {
      message: `Maximum ${config.maxEmails} email addresses allowed`,
    })
    .refine((emails) => emails.every((email) => emailRegex.test(email)), {
      message: config.errorMessage as string,
    });
};

/**
 * Creates a schema for invitation create form validation
 * @param options - Schema configuration options
 */
export const createInvitationCreateSchema = (options: InvitationCreateSchemas = {}) => {
  return z.object({
    email_list: createEmailListSchema(options),
    roles: z.array(z.string()).default([]),
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
