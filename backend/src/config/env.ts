import dotenv from 'dotenv';
dotenv.config();

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const isDev = (process.env.NODE_ENV || 'development') === 'development';

function resolveHrEmail(val?: string): string {
  if (!val) return 'humanresource@prioritybags.in';
  const clean = val.trim().toLowerCase();
  if (clean.includes('hscvpl.com') || clean.includes('hr@')) return 'humanresource@prioritybags.in';
  return val.trim();
}

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || (isDev ? 'dev_jwt_secret_priority_bags_key_2026' : ''),
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || (isDev ? 'dev_jwt_refresh_secret_priority_bags_key_2026' : ''),
  FRONTEND_URL: (process.env.FRONTEND_URL || corsOrigins[0] || 'http://localhost:3000').replace(/\/$/, ''),
  SUPABASE_URL: process.env.SUPABASE_URL || (isDev ? 'https://placeholder.supabase.co' : ''),
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || (isDev ? 'placeholder_key' : ''),
  CORS_ORIGINS: corsOrigins,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.ethereal.email',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@prioritybags.in',
  HR_EMAIL: resolveHrEmail(process.env.HR_EMAIL),
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || process.env.SMTP_PASS || '',
  // Shipping constants (single source of truth for backend + frontend)
  SHIPPING_THRESHOLD: 1499,
  SHIPPING_FEE: 99,
};

const requiredEnv = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CORS_ORIGIN'
];

if (!isDev) {
  requiredEnv.forEach(name => {
    if (!process.env[name]) {
      console.error(`❌ Missing critical environment variable: ${name}`);
      process.exit(1);
    }
  });
}
