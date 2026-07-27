import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { supabase } from './config/supabase';
import { AppError } from './lib/errors';

// Route Imports
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import reviewRoutes from './routes/review.routes';
import paymentRoutes from './routes/payment.routes';
import userRoutes from './routes/user.routes';
import jobsRoutes from './routes/jobs.routes';
import chatRoutes from './routes/chat.routes';
import settingsRoutes from './routes/settings.routes';
import sitemapRoutes from './routes/sitemap.routes';
import contactRoutes from './routes/contact.routes';
import couponRoutes from './routes/coupon.routes';
import analyticsRoutes from './routes/analytics.routes';
import supportRoutes from './routes/support.routes';

const app = express();

// Enable trust proxy for Render/Vercel
app.set('trust proxy', 1);

// --- Middleware ---
app.use(helmet());
app.use(compression());
// Use 'combined' (Apache-style) in production for proper log aggregation
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
// Production hosts always allowed (apex + www handled by www-stripping below),
// so login works regardless of which variant the browser is on.
const ALWAYS_ALLOWED_HOSTS = ['prioritybags.in'];
const stripWww = (host: string) => host.replace(/^www\./, '');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) { callback(null, true); return; }
    const clean = origin.replace(/\/$/, '');
    try {
      const host = stripWww(new URL(clean).host);
      const inAllowlist = config.CORS_ORIGINS.some((o) => {
        try { return stripWww(new URL(o).host) === host; } catch { return o === clean; }
      });
      if (inAllowlist || ALWAYS_ALLOWED_HOSTS.includes(host)) { callback(null, true); return; }
    } catch { /* malformed origin falls through to reject */ }
    callback(new AppError('Origin is not allowed', 403));
  },
  credentials: true,
}));
app.use(cookieParser());
// Keep JSON limit small; multer handles its own limits for file uploads
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// General API rate limit (increased for admin operations like bulk product updates)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limiter for auth endpoints — prevents credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again in 15 minutes.' },
});

// Strict limiter for AI chat — each request makes 1-2 Anthropic API calls
const authRecoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please wait a few minutes and try again.' },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages, please slow down and try again shortly.' },
});

const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many support requests. Please try again later.' },
});

// --- Routes ---
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authRecoveryLimiter);
app.use('/api/auth/reset-password', authRecoveryLimiter);
app.use('/api/auth/refresh', authRecoveryLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', sitemapRoutes);
app.use('/api/contact', supportLimiter, contactRoutes);
app.use('/api/support', supportLimiter, supportRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/api/health', async (_req, res) => {
  try {
    const { error } = await supabase.from('categories').select('id').limit(1);
    if (error) throw error;
    res.json({ 
      status: 'ok', 
      db: 'connected', 
      timestamp: new Date().toISOString(),
      version: '2.4.1'
    });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// --- Global Error Handler ---
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Structured error response — never leak internal details in production
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.statusCode : (err.status || 500);
  const message = isAppError ? err.message : (err.message || 'Internal Server Error');

  // Only log unexpected (5xx) errors at error level
  if (status >= 500) {
    console.error('❌ Unhandled Error:', err);
  }

  res.status(status).json({
    error: message,
    status: 'error',
    ...(err.code && { code: err.code }),
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
