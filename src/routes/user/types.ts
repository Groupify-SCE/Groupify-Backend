import { z } from 'zod';

export const userEditSchema = z.object({
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
  email: z.string().email().optional(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*\d)(?=.*[!@#$%^&*])/,
      'Password must contain at least one digit and one special character'
    )
    .optional(),
  passwordConfirmation: z.string().optional(),
});

export type UserEditSchema = z.infer<typeof userEditSchema>;
