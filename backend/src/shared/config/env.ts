import dotenv from 'dotenv';

dotenv.config();

const parsePort = (value: string | undefined) => {
  const port = Number(value ?? 4000);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  return port;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsePort(process.env.PORT),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  mongodbUri:
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/ems_asset_registry',
  jwtSecret:
    process.env.JWT_SECRET ?? 'development-only-change-this-secret-before-prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
};
