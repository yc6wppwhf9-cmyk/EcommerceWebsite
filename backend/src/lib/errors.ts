/**
 * Centralized error handling for the Priority Bags API.
 *
 * Usage:
 *   throw new AppError('Product not found', 404);
 *   throw new AppError('Insufficient stock', 400, 'STOCK_ERROR');
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Convenience factories for common error patterns. */
export const Errors = {
  notFound: (entity: string) => new AppError(`${entity} not found`, 404, 'NOT_FOUND'),
  badRequest: (msg: string) => new AppError(msg, 400, 'BAD_REQUEST'),
  unauthorized: (msg = 'Authentication required') => new AppError(msg, 401, 'UNAUTHORIZED'),
  forbidden: (msg = 'Access denied') => new AppError(msg, 403, 'FORBIDDEN'),
  conflict: (msg: string) => new AppError(msg, 409, 'CONFLICT'),
  server: (msg = 'Internal server error') => new AppError(msg, 500, 'SERVER_ERROR'),
} as const;

/**
 * Wraps an async route handler so that thrown errors (including AppError) are
 * automatically forwarded to Express's `next()` and handled by the global
 * error handler — no manual try/catch needed in controllers.
 */
export function asyncHandler(
  fn: (req: any, res: any, next: any) => Promise<any>,
) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
