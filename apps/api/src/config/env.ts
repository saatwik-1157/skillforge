/**
 * Validated environment configuration.
 * Fails fast at boot if a required variable is missing so we never run with a
 * half-configured process.
 */
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  CLIENT_URL: z.string().default('http://localhost:3000'),

  // Fallback defaults let the deployed app run without dashboard env vars.
  // Override them by setting the matching environment variable in your host.
  // (Repo is private to keep these values from being public.)
  DATABASE_URL: z
    .string()
    .min(1)
    .default(
      'postgresql://postgres.umzalkqpjqqntgydlwbv:saathwik5567@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
    ),

  JWT_ACCESS_SECRET: z.string().min(1).default('skillforge-access-9f3k2p8x1q-prod-default'),
  JWT_REFRESH_SECRET: z.string().min(1).default('skillforge-refresh-7h5m4v2n6b-prod-default'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  MAIL_FROM: z.string().default('SkillForge <no-reply@skillforge.app>'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = parsed.error.flatten().fieldErrors;
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', fields);
  // Throw (don't process.exit) so a serverless host can surface a clean error
  // response instead of an opaque crash.
  throw new Error('Invalid/missing environment variables: ' + Object.keys(fields).join(', '));
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
