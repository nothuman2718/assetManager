import { Router } from 'express';
import { z } from 'zod';

import { requireAuth, requireRoles } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { hashPassword } from '../auth/password.service.js';
import { createUser, listUsers } from './user.service.js';
import { userRoles } from './user.types.js';

export const usersRouter = Router();

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(userRoles),
});

usersRouter.use(requireAuth);

usersRouter.get(
  '/',
  requireRoles('Admin'),
  asyncHandler(async (_request, response) => {
    const users = await listUsers();

    response.status(200).json({ data: users });
  }),
);

usersRouter.post(
  '/',
  requireRoles('Admin'),
  asyncHandler(async (request, response) => {
    const payload = createUserSchema.parse(request.body);
    const passwordHash = await hashPassword(payload.password);
    const user = await createUser({
      name: payload.name,
      email: payload.email,
      role: payload.role,
      passwordHash,
    });

    response.status(201).json({ data: user });
  }),
);
