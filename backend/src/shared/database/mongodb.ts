import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { logger } from '../logger/logger.js';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongodbUri);
  logger.info('MongoDB connected');
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
