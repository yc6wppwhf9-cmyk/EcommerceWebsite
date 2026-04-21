import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { supabase } from './config/supabase';

// Route Imports
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import reviewRoutes from './routes/review.routes';
import paymentRoutes from './routes/payment.routes';
import userRoutes from './routes/user.routes';
import jobsRoutes from './routes/jobs.routes';
import chatRoutes from './routes/chat.routes';

const app = express();

// Enable trust proxy for Render/Vercel
app.set('trust proxy', 1);

// --- Middleware ---
app.use(helmet());
app.use(compression());
// Use 'combined' (Apache-style) in production for proper log aggregation
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
// Keep JSON limit small; multer handles its own limits for file uploads
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// General API rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

// --- Routes ---
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/chat', chatRoutes);

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
  console.error('❌ Global Error Handler:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    status: 'error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
