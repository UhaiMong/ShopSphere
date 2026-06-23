import { env } from './config/env.config';
import { createApp } from './app';
import { connectDB, disconnectDB } from './config/database';
import { logger } from './utils/logger';

//  Boot
const bootstrap = async (): Promise<void> => {
  // 1. Connect to MongoDB (exits process on failure)
  await connectDB();

  // 2. Create Express app with all middleware and routes
  const app = createApp();

  // 3. Start HTTP server
  const server = app.listen(env.PORT, () => {
    logger.info(`
  +====================================================
  + ShopSphere API
  + Environment : ${env.NODE_ENV}
  + Port        : ${env.PORT}
  + Base URL    : http://localhost:${env.PORT}/api/v1
  + Health      : http://localhost:${env.PORT}/health
  +====================================================
    `);
  });

  // Graceful Shutdown
  // On SIGTERM / SIGINT: stop accepting new connections, finish in-flight
  // requests, then close DB connections. Critical for zero-downtime deploys.

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);

    server.close(async () => {
      logger.info('HTTP server closed');
      await disconnectDB();
      logger.info('Shutdown complete');
      process.exit(0);
    });

    // Force shutdown after 10s if requests don't finish
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// Unhandled Rejections & Exceptions
// Catch-all safety net — these indicate programming bugs, not operational errors.

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled Promise Rejection — shutting down');
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error({ error }, 'Uncaught Exception — shutting down');
  process.exit(1);
});

// Go
bootstrap();
