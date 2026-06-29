import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Validation failed',
      details: error.issues,
    });
    return;
  }

  if (error instanceof Error && error.message.includes('already exists')) {
    response.status(409).json({ message: error.message });
    return;
  }

  if (error instanceof Error && error.message.includes('Invalid email')) {
    response.status(401).json({ message: error.message });
    return;
  }

  response.status(500).json({ message: 'Internal server error' });
};
