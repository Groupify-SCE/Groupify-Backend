import { z } from 'zod';

export const algorithmInputSchema = z.object({
  projectId: z.string().min(1),
});

export type AlgorithmInputSchema = z.infer<typeof algorithmInputSchema>;
