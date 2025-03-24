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

export const projectGetAllCriteriaSchema = z.object({
  projectId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
});

export type projectGetAllCriteriaData = z.infer<
  typeof projectGetAllCriteriaSchema
>;

export const projectUpdateCriterionSchema = z.object({
  criterionId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  name: z.string().min(1).max(100).optional(),
  range: z.number().min(1).max(1000).optional(),
});

export type projectUpdateCriterionData = z.infer<
  typeof projectUpdateCriterionSchema
>;

export const projectDeleteCriterionSchema = z.object({
  criterionId: z
    .string()
    .min(1)
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
});

export type projectDeleteCriterionData = z.infer<
  typeof projectDeleteCriterionSchema
>;
