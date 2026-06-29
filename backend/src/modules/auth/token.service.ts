import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../../shared/config/env.js';
import type { UserRole } from '../users/user.types.js';

export type AuthTokenPayload = {
  sub: string;
  role: UserRole;
};

export const signAuthToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  });

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const payload = jwt.verify(token, env.jwtSecret);

  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof payload.sub !== 'string' ||
    typeof payload.role !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }

  return {
    sub: payload.sub,
    role: payload.role as UserRole,
  };
};
