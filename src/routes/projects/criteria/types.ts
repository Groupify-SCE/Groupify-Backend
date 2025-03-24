import { z } from 'zod';

export const projectAddCriterionSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  name: z.string().min(1).max(100),
  range: z.number().min(1).max(1000),
});

export type projectAddCriterionData = z.infer<typeof projectAddCriterionSchema>;
