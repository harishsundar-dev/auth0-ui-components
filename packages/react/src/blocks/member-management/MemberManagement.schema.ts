import { z } from 'zod';

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  roles: z.array(z.string()).optional(),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
