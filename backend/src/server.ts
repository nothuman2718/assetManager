import { createApp } from './app.js';
import { env } from './shared/config/env.js';
import { connectDatabase } from './shared/database/mongodb.js';
import { logger } from './shared/logger/logger.js';

const startServer = async () => {
  try {
    await connectDatabase();

    const app = createApp();

    app.listen(env.port, () => {
      logger.info(`API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    logger.error('Failed to start API server', error);
    process.exit(1);
  }
};

void startServer();
