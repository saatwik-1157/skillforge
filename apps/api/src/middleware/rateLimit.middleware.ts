/**
 * Rate limiters. A generous global limiter protects the whole API; a strict
 * limiter guards sensitive auth endpoints (login, register, otp) from brute force.
 *
 * In a serverless (Netlify Function) runtime, `req.ip` isn't populated the usual
 * way, so we derive the client IP from the platform's forwarded headers and
 * disable express-rate-limit's IP validation to avoid noisy errors.
 */
import rateLimit from 'express-rate-limit';
import type { Request } from 'express';
import { env } from '../config/env';

function clientKey(req: Request): string {
  return (
    req.ip ||
    (req.headers['x-nf-client-connection-ip'] as string) ||
    ((req.headers['x-forwarded-for'] as string) || '').split(',')[0].trim() ||
    'global'
  );
}

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientKey,
  validate: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientKey,
  validate: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});
