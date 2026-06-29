import type { NextFunction, Request, Response } from 'express';

import { verifyAuthToken } from '../../modules/auth/token.service.js';
import { UserModel, toSafeUser } from '../../modules/users/user.model.js';
import type { SafeUser, UserRole } from '../../modules/users/user.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

const getBearerToken = (authorization?: string) => {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
};

export const requireAuth = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const token = getBearerToken(request.headers.authorization);

    if (!token) {
      response.status(401).json({ message: 'Authentication required' });
      return;
    }

    const payload = verifyAuthToken(token);
    const user = await UserModel.findOne({
      _id: payload.sub,
      status: 'active',
    }).exec();

    if (!user) {
      response.status(401).json({ message: 'Authentication required' });
      return;
    }

    request.user = toSafeUser(user);
    next();
  } catch {
    response.status(401).json({ message: 'Authentication required' });
  }
};

export const requireRoles =
  (...roles: UserRole[]) =>
  (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      response.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(request.user.role)) {
      response.status(403).json({ message: 'Forbidden' });
      return;
    }

    next();
  };
