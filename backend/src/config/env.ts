import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production',
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Missing Supabase configuration. Check your .env file.');
}
