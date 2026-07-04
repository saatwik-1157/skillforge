/**
 * Auth routes — mounted at /api/v1/auth.
 */
import { Router } from 'express';
import { authController } from './auth.controller';
import { authService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';
import {
  registerSchema,
  loginSchema,
  otpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleSchema,
} from './auth.schema';

// Bind service onto controller-less handlers where needed
void authService;

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate({ body: registerSchema }), asyncHandler(authController.register));
authRouter.post('/login', authLimiter, validate({ body: loginSchema }), asyncHandler(authController.login));
authRouter.post('/refresh', asyncHandler(authController.refresh));
authRouter.post('/logout', asyncHandler(authController.logout));
authRouter.get('/me', authenticate, asyncHandler(authController.me));
authRouter.post('/verify-otp', authLimiter, validate({ body: otpVerifySchema }), asyncHandler(authController.verifyOtp));
authRouter.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), asyncHandler(authController.forgotPassword));
authRouter.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), asyncHandler(authController.resetPassword));
authRouter.post('/google', authLimiter, validate({ body: googleSchema }), asyncHandler(authController.google));
