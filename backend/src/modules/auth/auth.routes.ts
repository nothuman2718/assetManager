import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { loginUser } from './auth.service.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  '/login',
  asyncHandler(async (request, response) => {
    const payload = loginSchema.parse(request.body);
    const result = await loginUser(payload.email, payload.password);

    response.status(200).json({ data: result });
  }),
);

authRouter.post('/logout', (_request, response) => {
  response.status(200).json({ data: { success: true } });
});

authRouter.get('/me', requireAuth, (request, response) => {
  response.status(200).json({ data: request.user });
});
