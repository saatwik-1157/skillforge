/**
 * Structured logger (pino). In dev it pretty-prints; in prod it emits JSON.
 */
import pino from 'pino';
import { isProd } from '../config/env';

// Pretty logs only when explicitly requested locally (LOG_PRETTY=true). By
// default (incl. the bundled serverless function) we emit plain JSON so pino
// never needs the `pino-pretty` transport, which isn't in the function bundle.
const usePretty = process.env.LOG_PRETTY === 'true' && !isProd;

export const logger = pino({
  level: isProd ? 'info' : 'debug',
  ...(usePretty
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
        },
      }
    : {}),
});
