-- Corporate Gifting & Bulk Order Inquiries Table
CREATE TABLE IF NOT EXISTS public.corporate_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  organisation_name TEXT NOT NULL,
  email TEXT NOT NULL,
  quantity TEXT NOT NULL,
  location TEXT NOT NULL,
  approx_budget TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'quoted', 'converted', 'closed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for searching and sorting
CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_created_at ON public.corporate_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_status ON public.corporate_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_email ON public.corporate_inquiries (email);

-- Enable RLS
ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY;

-- No policies: only the backend (service role, which bypasses RLS) may access this table.
