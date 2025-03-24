import { z } from 'zod';

export const projectDeleteSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
});

export type projectDeleteData = z.infer<typeof projectDeleteSchema>;
