import { z } from 'zod';

export const userRegisterSchema = z.object({
  firstName: z
    .string()
    .min(1)
    .regex(/^[A-Za-z-]+$/, 'First name can only contain letters or dashes'),
  lastName: z
    .string()
    .min(1)
    .regex(/^[A-Za-z-]+$/, 'Last name can only contain letters or dashes'),
  username: z
    .string()
    .min(6)
    .regex(
      /^[A-Za-z0-9_-]+$/,
      'Username can only contain letters, digits, dashes, or underscores'
    ),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*\d)(?=.*[!@#$%^&*])/,
      'Password must contain at least one digit and one special character'
    ),
  passwordConfirmation: z.string(),
});

export type UserRegisterSchema = z.infer<typeof userRegisterSchema>;
