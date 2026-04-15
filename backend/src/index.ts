import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { supabase } from './config/supabase';

// Route Imports
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';

const app = express();

// Enable trust proxy for Render/Vercel
app.set('trust proxy', 1);

// --- Middleware ---
app.use(helmet());
app.use(compression());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));

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

// Health Check
app.get('/api/health', async (_req, res) => {
  try {
    const { error } = await supabase.from('categories').select('id').limit(1);
    if (error) throw error;
    res.json({ 
      status: 'ok', 
      db: 'connected', 
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

export default app;
