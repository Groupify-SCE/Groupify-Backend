import { z } from 'zod';

export const projectAddParticipantSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  firstName: z
    .string()
    .min(1)
    .regex(/^[A-Za-z-]+$/, 'First name can only contain letters or dashes')
    .optional(),
  lastName: z
    .string()
    .min(1)
    .regex(/^[A-Za-z-]+$/, 'Last name can only contain letters or dashes')
    .optional(),
  tz: z
    .string()
    .min(9)
    .regex(/^\d{9}$/, 'ID must contain 9 digits')
    .optional(),
});

export type projectAddparticipantData = z.infer<
  typeof projectAddParticipantSchema
>;
