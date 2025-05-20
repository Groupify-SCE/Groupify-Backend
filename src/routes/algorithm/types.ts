import { z } from 'zod';

export const algorithmInputSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/),
});

export type AlgorithmInputSchema = z.infer<typeof algorithmInputSchema>;
