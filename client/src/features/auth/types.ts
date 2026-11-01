import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export const registerFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export const authResponseSchema = z.object({
  user: z.object({ id: z.string(), email: z.string(), createdAt: z.string() }),
  accessToken: z.string(),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
