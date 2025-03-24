import { z } from 'zod';

export const projectDeleteSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
});

export type projectDeleteData = z.infer<typeof projectDeleteSchema>;

export const projectGetSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
});

export type projectGetData = z.infer<typeof projectGetSchema>;

export const projectUpdateSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),

  name: z.string().min(1).max(100).optional(),
  participants: z.number().min(1).optional(),
  group_size: z.number().min(1).optional(),
});

export type projectUpdateData = z.infer<typeof projectUpdateSchema>;
