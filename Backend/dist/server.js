"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const database_1 = require("./config/database");
const env_config_1 = require("./config/env.config");
const logger_1 = require("./utils/logger");
//  Boot
const bootstrap = async () => {
    // 1. Connect to MongoDB (exits process on failure)
    await (0, database_1.connectDB)();
    // 2. Create Express app with all middleware and routes
    const app = (0, app_1.createApp)();
    // 3. Start HTTP server
    const server = app.listen(env_config_1.env.PORT, () => {
        logger_1.logger.info(`
  +====================================================
  + ShopSphere API
  + Environment : ${env_config_1.env.NODE_ENV}
  + Port        : ${env_config_1.env.PORT}
  + Base URL    : http://localhost:${env_config_1.env.PORT}/api/v1
  + Health      : http://localhost:${env_config_1.env.PORT}/health
  +====================================================
    `);
    });
    // Graceful Shutdown
    // On SIGTERM / SIGINT: stop accepting new connections, finish in-flight
    // requests, then close DB connections. Critical for zero-downtime deploys.
    const shutdown = async (signal) => {
        logger_1.logger.info(`${signal} received — shutting down gracefully`);
        server.close(async () => {
            logger_1.logger.info('HTTP server closed');
            await (0, database_1.disconnectDB)();
            logger_1.logger.info('Shutdown complete');
            process.exit(0);
        });
        // Force shutdown after 10s if requests don't finish
        setTimeout(() => {
            logger_1.logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10_000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};
// Unhandled Rejections & Exceptions
// Catch-all safety net — these indicate programming bugs, not operational errors.
process.on('unhandledRejection', (reason) => {
    logger_1.logger.error({ reason }, 'Unhandled Promise Rejection — shutting down');
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error({ error }, 'Uncaught Exception — shutting down');
    process.exit(1);
});
// Go
bootstrap();
//# sourceMappingURL=server.js.map