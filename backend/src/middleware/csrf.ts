import { Request, Response, NextFunction } from 'express';

/**
 * Double-Submit Cookie CSRF protection.
 *
 * On every mutating request (POST/PUT/PATCH/DELETE) that is authenticated via
 * cookie, the browser must also send the value of the `csrf_token` cookie as
 * the `X-CSRF-Token` header. Because JS on a different origin cannot read our
 * cookies (SOP), a forged cross-site request cannot reproduce the header value.
 *
 * Requests authenticated with a Bearer token (API clients / mobile) are exempt
 * because they're not vulnerable to CSRF by definition.
 */
export function validateCsrf(req: Request, res: Response, next: NextFunction) {
  // If the request uses Bearer auth it's an API client — skip CSRF check
  if (req.headers.authorization?.startsWith('Bearer ')) return next();

  const cookieToken: string | undefined = (req as any).cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }

  next();
}
