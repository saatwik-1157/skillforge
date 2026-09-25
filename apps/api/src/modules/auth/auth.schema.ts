/**
 * Zod schemas + inferred DTO types for the auth module.
 */
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72)
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  role: z.enum(['ENTREPRENEUR', 'MENTOR']).optional().default('ENTREPRENEUR'),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const otpVerifySchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().length(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().length(6),
  password: z.string().min(8).max(72),
});

export const googleSchema = z.object({
  idToken: z.string().min(10),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type OtpVerifyDto = z.infer<typeof otpVerifySchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type GoogleDto = z.infer<typeof googleSchema>;
