import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { authRouter } from './modules/auth/auth.routes.js';
import { assetsRouter } from './modules/assets/asset.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { devicesRouter } from './modules/assets/device.routes.js';
import { exportsRouter } from './modules/exports/export.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { buildingsRouter } from './modules/hierarchy/building.routes.js';
import { departmentsRouter } from './modules/hierarchy/department.routes.js';
import { panelsRouter } from './modules/hierarchy/panel.routes.js';
import { plantsRouter } from './modules/hierarchy/plant.routes.js';
import { hierarchyTreeRouter } from './modules/hierarchy/tree.routes.js';
import { importsRouter } from './modules/imports/import.routes.js';
import { maintenanceRouter } from './modules/maintenance/maintenance.routes.js';
import { usersRouter } from './modules/users/user.routes.js';
import { env } from './shared/config/env.js';
import { errorMiddleware } from './shared/middleware/error.middleware.js';

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
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/plants', plantsRouter);
  app.use('/api/buildings', buildingsRouter);
  app.use('/api/departments', departmentsRouter);
  app.use('/api/panels', panelsRouter);
  app.use('/api/assets', assetsRouter);
  app.use('/api/devices', devicesRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/maintenance', maintenanceRouter);
  app.use('/api/imports', importsRouter);
  app.use('/api/exports', exportsRouter);
  app.use('/api/hierarchy', hierarchyTreeRouter);

  app.use((_request, response) => {
    response.status(404).json({
      message: 'Route not found',
    });
  });
  app.use(errorMiddleware);

  return app;
};
