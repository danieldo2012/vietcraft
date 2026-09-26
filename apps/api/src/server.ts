import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { ENV } from './config/env';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    await connectDB();
    const app = createApp();

    const server = app.listen(ENV.PORT, () => {
      logger.info(`✨ VietCraft API server running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
      logger.info(`🌐 Health check: http://localhost:${ENV.PORT}/health`);
      logger.info(`📚 API root: http://localhost:${ENV.PORT}/api`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down...`);

      const forceExitTimer = setTimeout(() => {
        logger.error('Graceful shutdown timed out after 10s. Forcing exit.');
        process.exit(1);
      }, 10000);
      forceExitTimer.unref();

      server.close(async () => {
        try {
          await disconnectDB();
          logger.info('Server and database connections successfully closed.');
          process.exit(0);
        } catch (err) {
          logger.error('Error during database disconnect:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
