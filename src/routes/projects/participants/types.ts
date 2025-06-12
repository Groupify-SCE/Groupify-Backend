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

export type projectAddParticipantData = z.infer<
  typeof projectAddParticipantSchema
>;

export const projectGetAllParticipantSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
});

export type projectGetAllParticipantData = z.infer<
  typeof projectGetAllParticipantSchema
>;

export const projectGetParticipantIdSchema = z.object({
  participantId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
});

export type projectGetParticipantIdData = z.infer<
  typeof projectGetParticipantIdSchema
>;

export const projectUpdateParticipantCriteriaSchema = z.object({
  criteria: z.record(z.string(), z.coerce.number().min(0).max(1000)),
});

export type projectUpdateParticipantCriteriaData = z.infer<
  typeof projectUpdateParticipantCriteriaSchema
>;
