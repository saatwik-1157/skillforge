/**
 * Express application assembly. Security middleware first, then parsers, then
 * the versioned API router, then 404 + error handlers last.
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './utils/logger';
import { globalLimiter } from './middleware/rateLimit.middleware';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import { apiRouter } from './routes';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );

  // Parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Observability + throttling
  app.use(pinoHttp({ logger }));
  app.use(globalLimiter);

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'skillforge-api' }));

  // Versioned API
  app.use(env.API_PREFIX, apiRouter);

  // Fallbacks
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
