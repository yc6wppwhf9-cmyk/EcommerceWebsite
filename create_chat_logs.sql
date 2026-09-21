-- ═════════════════════════════════════════════════════════════════════════════════
-- Migration: Chat History Logging & Analytics Table
-- Run this in your Supabase SQL Editor
-- ═════════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  user_message TEXT NOT NULL,
  bot_response TEXT,
  intent_category TEXT DEFAULT 'general',
  products_matched JSONB DEFAULT '[]'::jsonb,
  user_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast queries and admin filtering
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_intent_category ON chat_logs(intent_category);

-- Enable RLS (Row Level Security)
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role and admins full access
CREATE POLICY "Admins have full access to chat_logs"
  ON chat_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);
