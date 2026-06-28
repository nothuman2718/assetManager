import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { healthRouter } from './modules/health/health.routes.js';
import { env } from './shared/config/env.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(morgan(env.nodeEnv === 'test' ? 'tiny' : 'dev'));

  app.get('/', (_request, response) => {
    response.status(200).json({
      name: 'EMS Asset Registry API',
      status: 'ready',
    });
  });

  app.use('/api/health', healthRouter);

  app.use((_request, response) => {
    response.status(404).json({
      message: 'Route not found',
    });
  });

  return app;
};
