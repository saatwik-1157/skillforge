/**
 * Structured logger (pino). In dev it pretty-prints; in prod it emits JSON.
 */
import pino from 'pino';
import { isProd } from '../config/env';

export const logger = pino({
  level: isProd ? 'info' : 'debug',
  ...(isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
        },
      }),
});
