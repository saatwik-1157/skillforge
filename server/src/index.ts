/**
 * Process entry point. Boots the HTTP server and wires graceful shutdown.
 */
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/prisma';

async function main() {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 SkillForge API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error(err, 'Fatal boot error');
  process.exit(1);
});
