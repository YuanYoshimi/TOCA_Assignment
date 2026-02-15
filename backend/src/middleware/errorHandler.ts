import type { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handler.
 * In production mode, stack traces are hidden.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[Error]', err.message);

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'Something went wrong' : err.message,
  });
}
