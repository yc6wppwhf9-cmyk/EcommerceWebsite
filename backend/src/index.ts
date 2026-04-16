import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { config } from './config/env';
import { supabase } from './config/supabase';

// Route Imports
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import reviewRoutes from './routes/review.routes';
import paymentRoutes from './routes/payment.routes';

const app = express();

// Enable trust proxy for Render/Vercel
app.set('trust proxy', 1);

// --- Middleware ---
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check
app.get('/api/health', async (_req, res) => {
  try {
    const { error } = await supabase.from('categories').select('id').limit(1);
    if (error) throw error;
    res.json({ 
      status: 'ok', 
      db: 'connected', 
      timestamp: new Date().toISOString(),
      version: '2.4.0'
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
控制,Description:
